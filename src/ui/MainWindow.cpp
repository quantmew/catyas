#include "ui/MainWindow.h"
#include <QApplication>
#include <QMessageBox>
#include <QHeaderView>
#include <QIcon>
#include <QPixmap>
#include <QTreeWidgetItem>
#include <QFile>
#include <QIODevice>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , centralWidget(nullptr)
    , mainSplitter(nullptr)
    , rightSplitter(nullptr)
    , databaseTree(nullptr)
    , centralTabs(nullptr)
    , tableListWidget(nullptr)
    , tableDataWidget(nullptr)
    , propertiesDock(nullptr)
    , propertiesWidget(nullptr)
    , statusLabel(nullptr)
    , connectionStatusLabel(nullptr)
{
    setupUI();
    createMenus();
    createToolBars();
    createStatusBar();

    setWindowTitle("catyas - Database Management Tool");
    setMinimumSize(1000, 700);
    resize(1400, 900);

    // Set application icon and style
    setWindowIcon(QIcon());

    // Load application stylesheet
    QFile styleFile(":/styles/catyas.qss");
    if (styleFile.open(QIODevice::ReadOnly)) {
        QString styleSheet = QString::fromUtf8(styleFile.readAll());
        setStyleSheet(styleSheet);
    } else {
        // Fallback inline styles
        setStyleSheet(
            "QMainWindow { background-color: #f0f0f0; }"
            "QToolBar { background-color: #ffffff; border: 1px solid #d0d0d0; }"
            "QMenuBar { background-color: #ffffff; }"
            "QStatusBar { background-color: #ffffff; border-top: 1px solid #d0d0d0; }"
        );
    }
}

MainWindow::~MainWindow()
{
}

void MainWindow::setupUI()
{
    centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);

    // Create main splitter (horizontal)
    mainSplitter = new QSplitter(Qt::Horizontal, this);

    // Create database tree (left panel)
    setupConnectionTree();

    // Create central area with table list and data views
    setupCentralArea();

    // Create right properties panel
    setupPropertiesPanel();

    // Configure main splitter
    mainSplitter->addWidget(databaseTree);
    mainSplitter->addWidget(centralTabs);
    mainSplitter->setSizes({280, 1120});

    // Set layout
    QHBoxLayout *layout = new QHBoxLayout(centralWidget);
    layout->addWidget(mainSplitter);
    layout->setContentsMargins(2, 2, 2, 2);

    // Add properties dock to right side
    addDockWidget(Qt::RightDockWidgetArea, propertiesDock);
}

void MainWindow::setupConnectionTree()
{
    databaseTree = new DatabaseTreeWidget(this);

    // Connect signals
    connect(databaseTree, &DatabaseTreeWidget::itemSelectionChanged,
            this, &MainWindow::onDatabaseTreeSelectionChanged);
    connect(databaseTree, &DatabaseTreeWidget::openTable,
            this, &MainWindow::onOpenTable);
}

void MainWindow::addDatabaseItem(QTreeWidgetItem *parent, const QString &dbName)
{
    QTreeWidgetItem *dbItem = new QTreeWidgetItem(parent);
    dbItem->setText(0, dbName);
    dbItem->setIcon(0, QIcon());
}

void MainWindow::setupCentralArea()
{
    // Create central tabs
    centralTabs = new QTabWidget(this);
    centralTabs->setTabsClosable(false);
    centralTabs->setStyleSheet(
        "QTabWidget::pane { border: 1px solid #d0d0d0; background: white; }"
        "QTabBar::tab { background: #f0f0f0; padding: 8px 16px; margin-right: 2px; }"
        "QTabBar::tab:selected { background: white; border-bottom: 2px solid #0078d4; }"
    );

    // Create table list widget
    tableListWidget = new TableListWidget();
    centralTabs->addTab(tableListWidget, "表列表");

    // Create table data widget
    tableDataWidget = new TableDataWidget();
    centralTabs->addTab(tableDataWidget, "表数据");

    // Connect signals
    connect(tableListWidget, &TableListWidget::tableSelected,
            this, &MainWindow::onTableSelected);
    connect(tableListWidget, &TableListWidget::openTable,
            this, &MainWindow::onOpenTable);
    connect(tableDataWidget, &TableDataWidget::dataChanged,
            this, &MainWindow::onTableDataChanged);

    connect(centralTabs, &QTabWidget::currentChanged,
            this, &MainWindow::onQueryTabChanged);
}

void MainWindow::setupPropertiesPanel()
{
    propertiesDock = new QDockWidget("属性", this);
    propertiesDock->setMinimumWidth(200);
    propertiesDock->setMaximumWidth(300);

    propertiesWidget = new QWidget();
    propertiesLayout = new QVBoxLayout(propertiesWidget);

    // Object info group
    objectInfoGroup = new QGroupBox("bond");
    objectInfoGroup->setStyleSheet(
        "QGroupBox { font-weight: bold; color: #0078d4; }"
        "QGroupBox::title { subcontrol-origin: margin; padding: 0 5px; }"
    );
    QVBoxLayout *infoLayout = new QVBoxLayout(objectInfoGroup);

    objectNameLabel = new QLabel("数据库");
    objectTypeLabel = new QLabel("");

    infoLayout->addWidget(objectNameLabel);
    infoLayout->addWidget(objectTypeLabel);

    // Details group
    detailsGroup = new QGroupBox("字符集");
    QVBoxLayout *detailsLayout = new QVBoxLayout(detailsGroup);

    charsetLabel = new QLabel("utf8mb4");
    detailsLayout->addWidget(charsetLabel);

    QGroupBox *collationGroup = new QGroupBox("排序规则");
    QVBoxLayout *collationLayout = new QVBoxLayout(collationGroup);
    collationLabel = new QLabel("utf8mb4_unicode_ci");
    collationLayout->addWidget(collationLabel);

    propertiesLayout->addWidget(objectInfoGroup);
    propertiesLayout->addWidget(detailsGroup);
    propertiesLayout->addWidget(collationGroup);
    propertiesLayout->addStretch();

    propertiesDock->setWidget(propertiesWidget);
    propertiesDock->setStyleSheet(
        "QDockWidget { background: white; }"
        "QDockWidget::title { background: #f0f0f0; padding: 5px; }"
    );
}

void MainWindow::createMenus()
{
    // Chinese menu names to match Navicat style
    fileMenu = menuBar()->addMenu("文件(&F)");
    editMenu = menuBar()->addMenu("编辑(&E)");
    viewMenu = menuBar()->addMenu("查看(&V)");
    QMenu *collectMenu = menuBar()->addMenu("收藏夹(&C)");
    toolsMenu = menuBar()->addMenu("工具(&T)");
    QMenu *windowMenu = menuBar()->addMenu("窗口(&W)");
    helpMenu = menuBar()->addMenu("帮助(&H)");

    // File menu actions
    newConnectionAction = new QAction("新建连接(&N)...", this);
    newConnectionAction->setShortcut(QKeySequence::New);
    newConnectionAction->setStatusTip("创建新的数据库连接");
    connect(newConnectionAction, &QAction::triggered, this, &MainWindow::onNewConnection);

    openQueryAction = new QAction("打开查询(&O)...", this);
    openQueryAction->setShortcut(QKeySequence::Open);
    openQueryAction->setStatusTip("打开查询文件");
    connect(openQueryAction, &QAction::triggered, this, &MainWindow::onOpenQuery);

    saveQueryAction = new QAction("保存查询(&S)", this);
    saveQueryAction->setShortcut(QKeySequence::Save);
    saveQueryAction->setStatusTip("保存当前查询");

    exitAction = new QAction("退出(&X)", this);
    exitAction->setShortcut(QKeySequence::Quit);
    exitAction->setStatusTip("退出应用程序");
    connect(exitAction, &QAction::triggered, this, &QWidget::close);

    fileMenu->addAction(newConnectionAction);
    fileMenu->addSeparator();
    fileMenu->addAction(openQueryAction);
    fileMenu->addAction(saveQueryAction);
    fileMenu->addSeparator();
    fileMenu->addAction(exitAction);

    // Help menu
    aboutAction = new QAction("关于 catyas(&A)", this);
    aboutAction->setStatusTip("显示关于对话框");
    connect(aboutAction, &QAction::triggered, this, &MainWindow::onAbout);

    helpMenu->addAction(aboutAction);
}

void MainWindow::createToolBars()
{
    QToolBar *mainToolBar = addToolBar("主工具栏");
    mainToolBar->setToolButtonStyle(Qt::ToolButtonTextUnderIcon);
    mainToolBar->setIconSize(QSize(32, 32));
    mainToolBar->setStyleSheet(
        "QToolBar { background: white; border: none; padding: 5px; }"
        "QToolButton { background: transparent; padding: 8px; margin: 2px; }"
        "QToolButton:hover { background: #e0e0e0; border-radius: 4px; }"
        "QToolButton:pressed { background: #d0d0d0; }"
    );

    // Create toolbar actions with icons and text
    newConnectionAction = new QAction(QIcon(), "连接", this);
    newConnectionAction->setStatusTip("新建数据库连接");
    connect(newConnectionAction, &QAction::triggered, this, &MainWindow::onNewConnection);

    newQueryAction = new QAction(QIcon(), "新建查询", this);
    newQueryAction->setStatusTip("新建查询");
    connect(newQueryAction, &QAction::triggered, this, &MainWindow::onOpenQuery);

    newTableAction = new QAction(QIcon(), "表", this);
    newTableAction->setStatusTip("新建表");
    connect(newTableAction, &QAction::triggered, this, &MainWindow::onNewTable);

    newViewAction = new QAction(QIcon(), "视图", this);
    newViewAction->setStatusTip("新建视图");
    connect(newViewAction, &QAction::triggered, this, &MainWindow::onNewView);

    newFunctionAction = new QAction(QIcon(), "函数", this);
    newFunctionAction->setStatusTip("新建函数");
    connect(newFunctionAction, &QAction::triggered, this, &MainWindow::onNewFunction);

    newUserAction = new QAction(QIcon(), "用户", this);
    newUserAction->setStatusTip("新建用户");
    connect(newUserAction, &QAction::triggered, this, &MainWindow::onNewUser);

    queryAction = new QAction(QIcon(), "查询", this);
    queryAction->setStatusTip("查询");

    backupAction = new QAction(QIcon(), "备份", this);
    backupAction->setStatusTip("备份");
    connect(backupAction, &QAction::triggered, this, &MainWindow::onNewBackup);

    autoRunAction = new QAction(QIcon(), "自动运行", this);
    autoRunAction->setStatusTip("自动运行");
    connect(autoRunAction, &QAction::triggered, this, &MainWindow::onAutoRun);

    modelAction = new QAction(QIcon(), "模型", this);
    modelAction->setStatusTip("模型");
    connect(modelAction, &QAction::triggered, this, &MainWindow::onModel);

    reportAction = new QAction(QIcon(), "报表", this);
    reportAction->setStatusTip("报表");

    // Add actions to toolbar
    mainToolBar->addAction(newConnectionAction);
    mainToolBar->addAction(newQueryAction);
    mainToolBar->addAction(newTableAction);
    mainToolBar->addAction(newViewAction);
    mainToolBar->addAction(newFunctionAction);
    mainToolBar->addAction(newUserAction);
    mainToolBar->addSeparator();
    mainToolBar->addAction(queryAction);
    mainToolBar->addAction(backupAction);
    mainToolBar->addAction(autoRunAction);
    mainToolBar->addAction(modelAction);
    mainToolBar->addAction(reportAction);
}

void MainWindow::createStatusBar()
{
    statusLabel = new QLabel("表", this);
    connectionStatusLabel = new QLabel("latyas    bond", this);

    // Status bar styling
    statusBar()->setStyleSheet(
        "QStatusBar { background: white; border-top: 1px solid #d0d0d0; }"
        "QLabel { padding: 2px 8px; }"
    );

    statusBar()->addWidget(statusLabel);
    statusBar()->addPermanentWidget(connectionStatusLabel);
}

void MainWindow::onNewConnection()
{
    QMessageBox::information(this, "新建连接", "新建连接对话框将在此实现。");
}

void MainWindow::onOpenQuery()
{
    QMessageBox::information(this, "打开查询", "打开查询对话框将在此实现。");
}

void MainWindow::onNewTable()
{
    QMessageBox::information(this, "新建表", "新建表对话框将在此实现。");
}

void MainWindow::onNewView()
{
    QMessageBox::information(this, "新建视图", "新建视图对话框将在此实现。");
}

void MainWindow::onNewFunction()
{
    QMessageBox::information(this, "新建函数", "新建函数对话框将在此实现。");
}

void MainWindow::onNewUser()
{
    QMessageBox::information(this, "新建用户", "新建用户对话框将在此实现。");
}

void MainWindow::onNewBackup()
{
    QMessageBox::information(this, "备份", "备份对话框将在此实现。");
}

void MainWindow::onAutoRun()
{
    QMessageBox::information(this, "自动运行", "自动运行功能将在此实现。");
}

void MainWindow::onModel()
{
    QMessageBox::information(this, "模型", "模型功能将在此实现。");
}

void MainWindow::onConnectionTreeItemClicked(QTreeWidgetItem *item, int column)
{
    Q_UNUSED(column)
    if (item) {
        QString itemText = item->text(0);
        statusLabel->setText(itemText);

        // Update properties panel based on selected item
        if (objectInfoGroup) {
            objectInfoGroup->setTitle(itemText);
        }
    }
}

void MainWindow::onQueryTabChanged(int index)
{
    Q_UNUSED(index)
    // Handle tab change if needed
}

void MainWindow::onAbout()
{
    QMessageBox::about(this, "关于 catyas",
                       "catyas 1.0.0\n\n"
                       "一个类似 Navicat 的数据库连接和管理工具\n\n"
                       "使用 Qt6 和 C++ 构建。");
}

void MainWindow::onDatabaseTreeSelectionChanged(const QString &itemType, const QString &itemName, const QString &parentName)
{
    statusLabel->setText(itemName);

    // Update properties panel based on selected item
    if (objectInfoGroup) {
        objectInfoGroup->setTitle(itemName);
    }

    // If a database is selected, load its tables
    if (itemType == "database") {
        tableListWidget->setDatabase(itemName);
        centralTabs->setCurrentWidget(tableListWidget);
        connectionStatusLabel->setText(QString("latyas    %1").arg(itemName));
    }
    // If tables folder is selected, show table list
    else if (itemType == "tables_folder" && !parentName.isEmpty()) {
        tableListWidget->setDatabase(parentName);
        centralTabs->setCurrentWidget(tableListWidget);
        connectionStatusLabel->setText(QString("latyas    %1").arg(parentName));
    }
}

void MainWindow::onOpenTable(const QString &databaseName, const QString &tableName)
{
    // Open table data view
    tableDataWidget->setTable(databaseName, tableName);
    centralTabs->setCurrentWidget(tableDataWidget);
    statusLabel->setText(QString("表: %1").arg(tableName));
    connectionStatusLabel->setText(QString("latyas    %1.%2").arg(databaseName, tableName));
}

void MainWindow::onTableSelected(const QString &tableName)
{
    statusLabel->setText(QString("选中表: %1").arg(tableName));
}

void MainWindow::onTableDataChanged()
{
    statusLabel->setText("数据已修改");
}