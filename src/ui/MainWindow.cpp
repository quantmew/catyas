#include "ui/MainWindow.h"
#include <QApplication>
#include <QMessageBox>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , centralWidget(nullptr)
    , mainSplitter(nullptr)
    , rightSplitter(nullptr)
    , connectionTree(nullptr)
    , queryTabs(nullptr)
    , resultTable(nullptr)
    , statusLabel(nullptr)
    , connectionStatusLabel(nullptr)
{
    setupUI();
    createMenus();
    createToolBars();
    createStatusBar();

    setWindowTitle("DB Navigator - Database Connection Manager");
    setMinimumSize(800, 600);
    resize(1200, 800);
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

    // Create connection tree (left panel)
    connectionTree = new QTreeWidget(this);
    connectionTree->setHeaderLabel("Database Connections");
    connectionTree->setMinimumWidth(250);
    connectionTree->setMaximumWidth(400);

    // Create right splitter (vertical)
    rightSplitter = new QSplitter(Qt::Vertical, this);

    // Create query tabs (top right)
    queryTabs = new QTabWidget(this);
    queryTabs->setTabsClosable(true);

    // Create result table (bottom right)
    resultTable = new QTableWidget(this);
    resultTable->setAlternatingRowColors(true);

    // Add widgets to splitters
    rightSplitter->addWidget(queryTabs);
    rightSplitter->addWidget(resultTable);
    rightSplitter->setSizes({300, 200});

    mainSplitter->addWidget(connectionTree);
    mainSplitter->addWidget(rightSplitter);
    mainSplitter->setSizes({250, 950});

    // Set layout
    QHBoxLayout *layout = new QHBoxLayout(centralWidget);
    layout->addWidget(mainSplitter);
    layout->setContentsMargins(5, 5, 5, 5);
}

void MainWindow::createMenus()
{
    // File menu
    fileMenu = menuBar()->addMenu("&File");

    newConnectionAction = new QAction("&New Connection...", this);
    newConnectionAction->setShortcut(QKeySequence::New);
    newConnectionAction->setStatusTip("Create a new database connection");
    connect(newConnectionAction, &QAction::triggered, this, &MainWindow::onNewConnection);

    openQueryAction = new QAction("&Open Query...", this);
    openQueryAction->setShortcut(QKeySequence::Open);
    openQueryAction->setStatusTip("Open a query file");
    connect(openQueryAction, &QAction::triggered, this, &MainWindow::onOpenQuery);

    saveQueryAction = new QAction("&Save Query", this);
    saveQueryAction->setShortcut(QKeySequence::Save);
    saveQueryAction->setStatusTip("Save the current query");

    exitAction = new QAction("E&xit", this);
    exitAction->setShortcut(QKeySequence::Quit);
    exitAction->setStatusTip("Exit the application");
    connect(exitAction, &QAction::triggered, this, &QWidget::close);

    fileMenu->addAction(newConnectionAction);
    fileMenu->addAction(openQueryAction);
    fileMenu->addAction(saveQueryAction);
    fileMenu->addSeparator();
    fileMenu->addAction(exitAction);

    // Edit menu
    editMenu = menuBar()->addMenu("&Edit");

    // View menu
    viewMenu = menuBar()->addMenu("&View");

    // Tools menu
    toolsMenu = menuBar()->addMenu("&Tools");

    // Help menu
    helpMenu = menuBar()->addMenu("&Help");

    aboutAction = new QAction("&About", this);
    aboutAction->setStatusTip("Show the application's About box");
    connect(aboutAction, &QAction::triggered, this, &MainWindow::onAbout);

    helpMenu->addAction(aboutAction);
}

void MainWindow::createToolBars()
{
    QToolBar *mainToolBar = addToolBar("Main");
    mainToolBar->addAction(newConnectionAction);
    mainToolBar->addAction(openQueryAction);
    mainToolBar->addAction(saveQueryAction);
}

void MainWindow::createStatusBar()
{
    statusLabel = new QLabel("Ready", this);
    connectionStatusLabel = new QLabel("No connection", this);

    statusBar()->addWidget(statusLabel);
    statusBar()->addPermanentWidget(connectionStatusLabel);
}

void MainWindow::onNewConnection()
{
    QMessageBox::information(this, "New Connection", "New Connection dialog will be implemented here.");
}

void MainWindow::onOpenQuery()
{
    QMessageBox::information(this, "Open Query", "Open Query dialog will be implemented here.");
}

void MainWindow::onAbout()
{
    QMessageBox::about(this, "About DB Navigator",
                       "DB Navigator 1.0.0\n\n"
                       "A database connection and management tool\n"
                       "similar to Navicat.\n\n"
                       "Built with Qt6 and C++.");
}