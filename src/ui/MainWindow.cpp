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
    , currentTranslator(nullptr)
    , languageActionGroup(nullptr)
{
    setupUI();
    createMenus();
    createToolBars();
    createStatusBar();

    setWindowTitle(tr("catyas - Database Management Tool"));
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
    centralTabs->addTab(tableListWidget, tr("Table List"));

    // Create table data widget
    tableDataWidget = new TableDataWidget();
    centralTabs->addTab(tableDataWidget, tr("Table Data"));

    // Connect signals
    connect(tableListWidget, &TableListWidget::tableSelected,
            this, &MainWindow::onTableSelected);
    connect(tableListWidget, &TableListWidget::openTable,
            this, &MainWindow::onOpenTableFromList);
    connect(tableDataWidget, &TableDataWidget::dataChanged,
            this, &MainWindow::onTableDataChanged);

    connect(centralTabs, &QTabWidget::currentChanged,
            this, &MainWindow::onQueryTabChanged);
}

void MainWindow::setupPropertiesPanel()
{
    propertiesDock = new QDockWidget(tr("Properties"), this);
    propertiesDock->setMinimumWidth(200);
    propertiesDock->setMaximumWidth(300);

    propertiesWidget = new QWidget();
    propertiesLayout = new QVBoxLayout(propertiesWidget);

    // Object info group
    objectInfoGroup = new QGroupBox(tr("Object Info"));
    objectInfoGroup->setStyleSheet(
        "QGroupBox { font-weight: bold; color: #0078d4; }"
        "QGroupBox::title { subcontrol-origin: margin; padding: 0 5px; }"
    );
    QVBoxLayout *infoLayout = new QVBoxLayout(objectInfoGroup);

    objectNameLabel = new QLabel(tr("Database"));
    objectTypeLabel = new QLabel("");

    infoLayout->addWidget(objectNameLabel);
    infoLayout->addWidget(objectTypeLabel);

    // Details group
    detailsGroup = new QGroupBox(tr("Character Set"));
    QVBoxLayout *detailsLayout = new QVBoxLayout(detailsGroup);

    charsetLabel = new QLabel("utf8mb4");
    detailsLayout->addWidget(charsetLabel);

    QGroupBox *collationGroup = new QGroupBox(tr("Collation"));
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
    // Create menus
    fileMenu = menuBar()->addMenu(tr("&File"));
    editMenu = menuBar()->addMenu(tr("&Edit"));
    viewMenu = menuBar()->addMenu(tr("&View"));
    QMenu *collectMenu = menuBar()->addMenu(tr("&Favorites"));
    toolsMenu = menuBar()->addMenu(tr("&Tools"));
    QMenu *windowMenu = menuBar()->addMenu(tr("&Window"));
    languageMenu = menuBar()->addMenu(tr("&Language"));
    helpMenu = menuBar()->addMenu(tr("&Help"));

    // File menu actions
    QAction *newProjectAction = new QAction(tr("New &Project"), this);
    newProjectAction->setStatusTip(tr("Create a new project"));

    newConnectionAction = new QAction(tr("New &Connection..."), this);
    newConnectionAction->setShortcut(QKeySequence::New);
    newConnectionAction->setStatusTip(tr("Create a new database connection"));
    connect(newConnectionAction, &QAction::triggered, this, &MainWindow::onNewConnection);

    // Create "New" submenu
    QMenu *newMenu = new QMenu(tr("&New"), this);

    // New submenu actions
    QAction *newTableAction = new QAction(tr("&Table(V)..."), this);
    newTableAction->setStatusTip(tr("Create new table"));
    connect(newTableAction, &QAction::triggered, this, &MainWindow::onNewTable);

    QAction *newViewAction = new QAction(tr("&View(W)..."), this);
    newViewAction->setStatusTip(tr("Create new view"));
    connect(newViewAction, &QAction::triggered, this, &MainWindow::onNewView);

    QAction *newFunctionAction = new QAction(tr("&Function(X)..."), this);
    newFunctionAction->setStatusTip(tr("Create new function"));
    connect(newFunctionAction, &QAction::triggered, this, &MainWindow::onNewFunction);

    QAction *newUserAction = new QAction(tr("&User(Y)..."), this);
    newUserAction->setStatusTip(tr("Create new user"));
    connect(newUserAction, &QAction::triggered, this, &MainWindow::onNewUser);

    QAction *newOtherAction = new QAction(tr("&Other(Z)"), this);
    newOtherAction->setStatusTip(tr("Create other database object"));
    connect(newOtherAction, &QAction::triggered, this, &MainWindow::onNewOther);

    QAction *newQueryAction = new QAction(tr("&Query..."), this);
    newQueryAction->setStatusTip(tr("Create new query"));
    connect(newQueryAction, &QAction::triggered, this, &MainWindow::onNewQuery);

    QAction *newBackupAction = new QAction(tr("&Backup..."), this);
    newBackupAction->setStatusTip(tr("Create new backup"));
    connect(newBackupAction, &QAction::triggered, this, &MainWindow::onNewBackup);

    QAction *newAutoRunAction = new QAction(tr("&Auto Run..."), this);
    newAutoRunAction->setStatusTip(tr("Create new auto run task"));
    connect(newAutoRunAction, &QAction::triggered, this, &MainWindow::onAutoRun);

    QAction *newModelAction = new QAction(tr("&Model..."), this);
    newModelAction->setStatusTip(tr("Create new model"));
    connect(newModelAction, &QAction::triggered, this, &MainWindow::onModel);

    QAction *newChartWorkspaceAction = new QAction(tr("&Chart Workspace..."), this);
    newChartWorkspaceAction->setStatusTip(tr("Create new chart workspace"));
    connect(newChartWorkspaceAction, &QAction::triggered, this, &MainWindow::onNewChartWorkspace);

    // Add actions to new submenu
    newMenu->addAction(newTableAction);
    newMenu->addAction(newViewAction);
    newMenu->addAction(newFunctionAction);
    newMenu->addAction(newUserAction);
    newMenu->addAction(newOtherAction);
    newMenu->addSeparator();
    newMenu->addAction(newQueryAction);
    newMenu->addAction(newBackupAction);
    newMenu->addAction(newAutoRunAction);
    newMenu->addAction(newModelAction);
    newMenu->addAction(newChartWorkspaceAction);

    QAction *openExternalFileAction = new QAction(tr("Open &External File..."), this);
    openExternalFileAction->setShortcut(QKeySequence::Open);
    openExternalFileAction->setStatusTip(tr("Open external file"));

    QAction *openRecentlyUsedAction = new QAction(tr("Open &Recently Used"), this);
    openRecentlyUsedAction->setStatusTip(tr("Open recently used files"));

    QAction *closeConnectionAction = new QAction(tr("&Close Connection"), this);
    closeConnectionAction->setStatusTip(tr("Close current connection"));

    QAction *importConnectionAction = new QAction(tr("&Import Connection..."), this);
    importConnectionAction->setStatusTip(tr("Import connection settings"));

    QAction *exportConnectionAction = new QAction(tr("&Export Connection..."), this);
    exportConnectionAction->setStatusTip(tr("Export connection settings"));

    QAction *closeWindowAction = new QAction(tr("Close &Window"), this);
    closeWindowAction->setShortcut(QKeySequence::Close);
    closeWindowAction->setStatusTip(tr("Close current window"));

    QAction *closeTabAction = new QAction(tr("Close &Tab"), this);
    closeTabAction->setShortcut(QKeySequence("Ctrl+W"));
    closeTabAction->setStatusTip(tr("Close current tab"));

    exitAction = new QAction(tr("E&xit Catyas"), this);
    exitAction->setShortcut(QKeySequence::Quit);
    exitAction->setStatusTip(tr("Exit the application"));
    connect(exitAction, &QAction::triggered, this, &QWidget::close);

    // Add actions to file menu
    fileMenu->addAction(newProjectAction);
    fileMenu->addAction(newConnectionAction);
    fileMenu->addMenu(newMenu);
    fileMenu->addSeparator();
    fileMenu->addAction(openExternalFileAction);
    fileMenu->addAction(openRecentlyUsedAction);
    fileMenu->addSeparator();
    fileMenu->addAction(closeConnectionAction);
    fileMenu->addSeparator();
    fileMenu->addAction(importConnectionAction);
    fileMenu->addAction(exportConnectionAction);
    fileMenu->addSeparator();
    fileMenu->addAction(closeWindowAction);
    fileMenu->addAction(closeTabAction);
    fileMenu->addSeparator();
    fileMenu->addAction(exitAction);

    // Help menu
    aboutAction = new QAction(tr("&About catyas"), this);
    aboutAction->setStatusTip(tr("Show about dialog"));
    connect(aboutAction, &QAction::triggered, this, &MainWindow::onAbout);

    // Language menu
    languageActionGroup = new QActionGroup(this);

    englishAction = new QAction(tr("English"), this);
    englishAction->setCheckable(true);
    englishAction->setActionGroup(languageActionGroup);
    connect(englishAction, &QAction::triggered, this, &MainWindow::switchToEnglish);

    chineseAction = new QAction(tr("中文"), this);
    chineseAction->setCheckable(true);
    chineseAction->setActionGroup(languageActionGroup);
    chineseAction->setChecked(true); // Default to Chinese
    connect(chineseAction, &QAction::triggered, this, &MainWindow::switchToChinese);

    languageMenu->addAction(englishAction);
    languageMenu->addAction(chineseAction);

    // Edit menu actions
    undoAction = new QAction(tr("&Undo"), this);
    undoAction->setShortcut(QKeySequence::Undo);
    undoAction->setStatusTip(tr("Undo the last operation"));
    connect(undoAction, &QAction::triggered, this, &MainWindow::onUndo);

    redoAction = new QAction(tr("&Redo"), this);
    redoAction->setShortcut(QKeySequence::Redo);
    redoAction->setStatusTip(tr("Redo the last operation"));
    connect(redoAction, &QAction::triggered, this, &MainWindow::onRedo);

    cutAction = new QAction(tr("Cu&t"), this);
    cutAction->setShortcut(QKeySequence::Cut);
    cutAction->setStatusTip(tr("Cut the current selection"));
    connect(cutAction, &QAction::triggered, this, &MainWindow::onCut);

    copyAction = new QAction(tr("&Copy"), this);
    copyAction->setShortcut(QKeySequence::Copy);
    copyAction->setStatusTip(tr("Copy the current selection"));
    connect(copyAction, &QAction::triggered, this, &MainWindow::onCopy);

    pasteAction = new QAction(tr("&Paste"), this);
    pasteAction->setShortcut(QKeySequence::Paste);
    pasteAction->setStatusTip(tr("Paste the clipboard content"));
    connect(pasteAction, &QAction::triggered, this, &MainWindow::onPaste);

    selectAllAction = new QAction(tr("Select &All"), this);
    selectAllAction->setShortcut(QKeySequence::SelectAll);
    selectAllAction->setStatusTip(tr("Select all text"));
    connect(selectAllAction, &QAction::triggered, this, &MainWindow::onSelectAll);

    findAction = new QAction(tr("&Find..."), this);
    findAction->setShortcut(QKeySequence::Find);
    findAction->setStatusTip(tr("Find text"));
    connect(findAction, &QAction::triggered, this, &MainWindow::onFind);

    replaceAction = new QAction(tr("&Replace..."), this);
    replaceAction->setShortcut(QKeySequence::Replace);
    replaceAction->setStatusTip(tr("Replace text"));
    connect(replaceAction, &QAction::triggered, this, &MainWindow::onReplace);

    goToLineAction = new QAction(tr("&Go to Line..."), this);
    goToLineAction->setShortcut(QKeySequence("Ctrl+G"));
    goToLineAction->setStatusTip(tr("Go to specific line"));
    connect(goToLineAction, &QAction::triggered, this, &MainWindow::onGoToLine);

    // Add actions to edit menu
    editMenu->addAction(undoAction);
    editMenu->addAction(redoAction);
    editMenu->addSeparator();
    editMenu->addAction(cutAction);
    editMenu->addAction(copyAction);
    editMenu->addAction(pasteAction);
    editMenu->addSeparator();
    editMenu->addAction(selectAllAction);
    editMenu->addSeparator();
    editMenu->addAction(findAction);
    editMenu->addAction(replaceAction);
    editMenu->addAction(goToLineAction);

    helpMenu->addAction(aboutAction);
}

void MainWindow::createToolBars()
{
    QToolBar *mainToolBar = addToolBar(tr("Main Toolbar"));
    mainToolBar->setToolButtonStyle(Qt::ToolButtonTextUnderIcon);
    mainToolBar->setIconSize(QSize(32, 32));
    mainToolBar->setStyleSheet(
        "QToolBar { background: white; border: none; padding: 5px; }"
        "QToolButton { background: transparent; padding: 8px; margin: 2px; }"
        "QToolButton:hover { background: #e0e0e0; border-radius: 4px; }"
        "QToolButton:pressed { background: #d0d0d0; }"
    );

    // Create toolbar actions with icons and text
    newConnectionAction = new QAction(QIcon(), tr("Connection"), this);
    newConnectionAction->setStatusTip(tr("New database connection"));
    connect(newConnectionAction, &QAction::triggered, this, &MainWindow::onNewConnection);

    newQueryAction = new QAction(QIcon(), tr("New Query"), this);
    newQueryAction->setStatusTip(tr("New query"));
    connect(newQueryAction, &QAction::triggered, this, &MainWindow::onOpenQuery);

    newTableAction = new QAction(QIcon(), tr("Table"), this);
    newTableAction->setStatusTip(tr("New table"));
    connect(newTableAction, &QAction::triggered, this, &MainWindow::onNewTable);

    newViewAction = new QAction(QIcon(), tr("View"), this);
    newViewAction->setStatusTip(tr("New view"));
    connect(newViewAction, &QAction::triggered, this, &MainWindow::onNewView);

    newFunctionAction = new QAction(QIcon(), tr("Function"), this);
    newFunctionAction->setStatusTip(tr("New function"));
    connect(newFunctionAction, &QAction::triggered, this, &MainWindow::onNewFunction);

    newUserAction = new QAction(QIcon(), tr("User"), this);
    newUserAction->setStatusTip(tr("New user"));
    connect(newUserAction, &QAction::triggered, this, &MainWindow::onNewUser);

    queryAction = new QAction(QIcon(), tr("Query"), this);
    queryAction->setStatusTip(tr("Query"));

    backupAction = new QAction(QIcon(), tr("Backup"), this);
    backupAction->setStatusTip(tr("Backup"));
    connect(backupAction, &QAction::triggered, this, &MainWindow::onNewBackup);

    autoRunAction = new QAction(QIcon(), tr("Auto Run"), this);
    autoRunAction->setStatusTip(tr("Auto run"));
    connect(autoRunAction, &QAction::triggered, this, &MainWindow::onAutoRun);

    modelAction = new QAction(QIcon(), tr("Model"), this);
    modelAction->setStatusTip(tr("Model"));
    connect(modelAction, &QAction::triggered, this, &MainWindow::onModel);

    reportAction = new QAction(QIcon(), tr("Report"), this);
    reportAction->setStatusTip(tr("Report"));

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
    statusLabel = new QLabel(tr("Table"), this);
    connectionStatusLabel = new QLabel("catyas    bond", this);

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
    NewConnectionDialog dialog(this);
    if (dialog.exec() == QDialog::Accepted) {
        ConnectionSettings settings = dialog.getConnectionSettings();

        // TODO: Save connection settings and add to database tree
        QString message = tr("Connection '%1' created successfully!\n\nType: %2\nHost: %3\nPort: %4")
                         .arg(settings.connectionName)
                         .arg(static_cast<int>(settings.type))
                         .arg(settings.hostname)
                         .arg(settings.port);

        QMessageBox::information(this, tr("Connection Created"), message);

        // Add connection to database tree (placeholder)
        databaseTree->addConnection(settings.connectionName);
    }
}

void MainWindow::onOpenQuery()
{
    QMessageBox::information(this, tr("Open Query"), tr("Open query dialog will be implemented here."));
}

void MainWindow::onNewTable()
{
    QMessageBox::information(this, tr("New Table"), tr("New table dialog will be implemented here."));
}

void MainWindow::onNewView()
{
    QMessageBox::information(this, tr("New View"), tr("New view dialog will be implemented here."));
}

void MainWindow::onNewFunction()
{
    QMessageBox::information(this, tr("New Function"), tr("New function dialog will be implemented here."));
}

void MainWindow::onNewUser()
{
    QMessageBox::information(this, tr("New User"), tr("New user dialog will be implemented here."));
}

void MainWindow::onNewOther()
{
    QMessageBox::information(this, tr("New Other"), tr("New other object dialog will be implemented here."));
}

void MainWindow::onNewQuery()
{
    QMessageBox::information(this, tr("New Query"), tr("New query dialog will be implemented here."));
}

void MainWindow::onNewChartWorkspace()
{
    QMessageBox::information(this, tr("New Chart Workspace"), tr("New chart workspace dialog will be implemented here."));
}

void MainWindow::onNewBackup()
{
    QMessageBox::information(this, tr("Backup"), tr("Backup dialog will be implemented here."));
}

void MainWindow::onAutoRun()
{
    QMessageBox::information(this, tr("Auto Run"), tr("Auto run functionality will be implemented here."));
}

void MainWindow::onModel()
{
    QMessageBox::information(this, tr("Model"), tr("Model functionality will be implemented here."));
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
    QMessageBox::about(this, tr("About catyas"),
                       tr("catyas 1.0.0\n\n"
                          "A Navicat-like database connection and management tool\n\n"
                          "Built with Qt6 and C++."));
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
        connectionStatusLabel->setText(QString("catyas    %1").arg(itemName));
    }
    // If tables folder is selected, show table list
    else if (itemType == "tables_folder" && !parentName.isEmpty()) {
        tableListWidget->setDatabase(parentName);
        centralTabs->setCurrentWidget(tableListWidget);
        connectionStatusLabel->setText(QString("catyas    %1").arg(parentName));
    }
}

void MainWindow::onOpenTable(const QString &databaseName, const QString &tableName)
{
    // Open table data view
    tableDataWidget->setTable(databaseName, tableName);
    centralTabs->setCurrentWidget(tableDataWidget);
    statusLabel->setText(QString(tr("Table: %1")).arg(tableName));
    connectionStatusLabel->setText(QString("catyas    %1.%2").arg(databaseName, tableName));
}

void MainWindow::onOpenTableFromList(const QString &tableName)
{
    // When opening from table list, we need to get the current database
    // For now, use a placeholder database name - this should be improved to track current database
    QString currentDatabase = "currentdb"; // TODO: Track actual current database
    onOpenTable(currentDatabase, tableName);
}

void MainWindow::onTableSelected(const QString &tableName)
{
    statusLabel->setText(QString(tr("Selected table: %1")).arg(tableName));
}

void MainWindow::onTableDataChanged()
{
    statusLabel->setText(tr("Data modified"));
}

void MainWindow::switchToEnglish()
{
    if (currentTranslator) {
        qApp->removeTranslator(currentTranslator);
        delete currentTranslator;
        currentTranslator = nullptr;
    }

    currentTranslator = new QTranslator(this);
    if (currentTranslator->load(":/translations/catyas_en") ||
        currentTranslator->load("catyas_en", "translations")) {
        qApp->installTranslator(currentTranslator);
    }

    // Force UI refresh to apply new translations
    close();
    show();
}

void MainWindow::switchToChinese()
{
    if (currentTranslator) {
        qApp->removeTranslator(currentTranslator);
        delete currentTranslator;
        currentTranslator = nullptr;
    }

    currentTranslator = new QTranslator(this);
    if (currentTranslator->load(":/translations/catyas_zh_CN") ||
        currentTranslator->load("catyas_zh_CN", "translations")) {
        qApp->installTranslator(currentTranslator);
    }

    // Force UI refresh to apply new translations
    close();
    show();
}

void MainWindow::onUndo()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        // Try to send undo to the focused widget
        if (qobject_cast<QLineEdit*>(focused) || qobject_cast<QTextEdit*>(focused)) {
            QKeyEvent event(QEvent::KeyPress, Qt::Key_Z, Qt::ControlModifier);
            QApplication::sendEvent(focused, &event);
        }
    }
    statusLabel->setText(tr("Undo"));
}

void MainWindow::onRedo()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        // Try to send redo to the focused widget
        if (qobject_cast<QLineEdit*>(focused) || qobject_cast<QTextEdit*>(focused)) {
            QKeyEvent event(QEvent::KeyPress, Qt::Key_Y, Qt::ControlModifier);
            QApplication::sendEvent(focused, &event);
        }
    }
    statusLabel->setText(tr("Redo"));
}

void MainWindow::onCut()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        if (QLineEdit *lineEdit = qobject_cast<QLineEdit*>(focused)) {
            lineEdit->cut();
        } else if (QTextEdit *textEdit = qobject_cast<QTextEdit*>(focused)) {
            textEdit->cut();
        }
    }
    statusLabel->setText(tr("Cut"));
}

void MainWindow::onCopy()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        if (QLineEdit *lineEdit = qobject_cast<QLineEdit*>(focused)) {
            lineEdit->copy();
        } else if (QTextEdit *textEdit = qobject_cast<QTextEdit*>(focused)) {
            textEdit->copy();
        } else if (QTableWidget *tableWidget = qobject_cast<QTableWidget*>(focused)) {
            // Handle table widget copy
            QList<QTableWidgetItem*> selectedItems = tableWidget->selectedItems();
            if (!selectedItems.isEmpty()) {
                QString copyText;
                for (QTableWidgetItem *item : selectedItems) {
                    if (item) {
                        copyText += item->text() + "\t";
                    }
                }
                QApplication::clipboard()->setText(copyText);
            }
        }
    }
    statusLabel->setText(tr("Copy"));
}

void MainWindow::onPaste()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        if (QLineEdit *lineEdit = qobject_cast<QLineEdit*>(focused)) {
            lineEdit->paste();
        } else if (QTextEdit *textEdit = qobject_cast<QTextEdit*>(focused)) {
            textEdit->paste();
        }
    }
    statusLabel->setText(tr("Paste"));
}

void MainWindow::onSelectAll()
{
    QWidget *focused = QApplication::focusWidget();
    if (focused) {
        if (QLineEdit *lineEdit = qobject_cast<QLineEdit*>(focused)) {
            lineEdit->selectAll();
        } else if (QTextEdit *textEdit = qobject_cast<QTextEdit*>(focused)) {
            textEdit->selectAll();
        } else if (QTableWidget *tableWidget = qobject_cast<QTableWidget*>(focused)) {
            tableWidget->selectAll();
        }
    }
    statusLabel->setText(tr("Select All"));
}

void MainWindow::onFind()
{
    QMessageBox::information(this, tr("Find"), tr("Find dialog will be implemented here."));
}

void MainWindow::onReplace()
{
    QMessageBox::information(this, tr("Replace"), tr("Replace dialog will be implemented here."));
}

void MainWindow::onGoToLine()
{
    QMessageBox::information(this, tr("Go to Line"), tr("Go to Line dialog will be implemented here."));
}