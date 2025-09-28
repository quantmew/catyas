#include "ui/DatabaseTreeWidget.h"
#include <QHeaderView>
#include <QIcon>

DatabaseTreeWidget::DatabaseTreeWidget(QWidget *parent)
    : QTreeWidget(parent)
{
    setHeaderLabel("Database Connections");
    setMinimumWidth(250);
    setMaximumWidth(350);

    // Styling
    setStyleSheet(
        "QTreeWidget { "
        "   background-color: white; "
        "   border: 1px solid #d0d0d0; "
        "   font-size: 13px; "
        "}"
        "QTreeWidget::item { "
        "   padding: 4px; "
        "   border: none; "
        "}"
        "QTreeWidget::item:selected { "
        "   background-color: #0078d4; "
        "   color: white; "
        "}"
        "QTreeWidget::item:hover { "
        "   background-color: #e5f3ff; "
        "}"
        "QTreeWidget::branch:has-siblings:!adjoins-item { "
        "   border-image: url(vline.png) 0; "
        "}"
        "QTreeWidget::branch:has-siblings:adjoins-item { "
        "   border-image: url(branch-more.png) 0; "
        "}"
        "QTreeWidget::branch:!has-children:!has-siblings:adjoins-item { "
        "   border-image: url(branch-end.png) 0; "
        "}"
        "QTreeWidget::branch:has-children:!has-siblings:closed, "
        "QTreeWidget::branch:closed:has-children:has-siblings { "
        "   border-image: none; "
        "   image: url(branch-closed.png); "
        "}"
        "QTreeWidget::branch:open:has-children:!has-siblings, "
        "QTreeWidget::branch:open:has-children:has-siblings { "
        "   border-image: none; "
        "   image: url(branch-open.png); "
        "}"
    );

    setupContextMenu();
    setupSampleData();

    connect(this, &QTreeWidget::itemClicked, this, &DatabaseTreeWidget::onItemClicked);
    connect(this, &QTreeWidget::itemDoubleClicked, this, &DatabaseTreeWidget::onItemDoubleClicked);
}

DatabaseTreeWidget::~DatabaseTreeWidget()
{
}

void DatabaseTreeWidget::setupSampleData()
{
    clear();

    // Add sample connection
    QTreeWidgetItem *localHost = new QTreeWidgetItem(this);
    localHost->setText(0, "latyas");
    localHost->setData(0, Qt::UserRole, "connection");
    localHost->setIcon(0, QIcon()); // Will add server icon later

    // Add sample databases
    QStringList databases = {"bond", "finance", "future", "information_schema",
                           "jydb", "macro", "opt", "performance_schema", "quantmew_db", "sup"};

    for (const QString &dbName : databases) {
        QTreeWidgetItem *dbItem = new QTreeWidgetItem(localHost);
        dbItem->setText(0, dbName);
        dbItem->setData(0, Qt::UserRole, "database");
        dbItem->setIcon(0, QIcon()); // Will add database icon later

        addDatabaseStructure(dbItem);
    }

    expandAll();
}

void DatabaseTreeWidget::addConnection(const QString &connectionName)
{
    QTreeWidgetItem *connectionItem = new QTreeWidgetItem(this);
    connectionItem->setText(0, connectionName);
    connectionItem->setData(0, Qt::UserRole, "connection");
    connectionItem->setIcon(0, QIcon());
}

void DatabaseTreeWidget::addDatabase(const QString &connectionName, const QString &databaseName)
{
    QTreeWidgetItem *connectionItem = findConnectionItem(connectionName);
    if (!connectionItem) return;

    QTreeWidgetItem *dbItem = new QTreeWidgetItem(connectionItem);
    dbItem->setText(0, databaseName);
    dbItem->setData(0, Qt::UserRole, "database");
    dbItem->setIcon(0, QIcon());

    addDatabaseStructure(dbItem);
}

void DatabaseTreeWidget::addDatabaseStructure(QTreeWidgetItem *dbItem)
{
    // Add tables folder
    QTreeWidgetItem *tablesFolder = new QTreeWidgetItem(dbItem);
    tablesFolder->setText(0, "表");
    tablesFolder->setData(0, Qt::UserRole, "tables_folder");
    tablesFolder->setIcon(0, QIcon());

    // Add sample tables under finance database
    if (dbItem->text(0) == "finance") {
        QStringList tables = {"CSI_WEIGHT_MONTH", "FINANCE_BALANCE_SHEET", "FINANCE_BALANCE_SHEET_PARENT",
                             "FINANCE_CASHFLOW_STATEMENT", "FINANCE_CASHFLOW_STATEMENT_PARENT",
                             "FINANCE_INCOME_STATEMENT", "FINANCE_INCOME_STATEMENT_PARENT",
                             "FUND_DIVIDEND", "FUND_DIVIDEND_old", "FUND_FIN_INDICATOR"};

        for (const QString &tableName : tables) {
            QTreeWidgetItem *tableItem = new QTreeWidgetItem(tablesFolder);
            tableItem->setText(0, tableName);
            tableItem->setData(0, Qt::UserRole, "table");
            tableItem->setIcon(0, QIcon());
        }
    }

    // Add views folder
    QTreeWidgetItem *viewsFolder = new QTreeWidgetItem(dbItem);
    viewsFolder->setText(0, "视图");
    viewsFolder->setData(0, Qt::UserRole, "views_folder");
    viewsFolder->setIcon(0, QIcon());

    // Add functions folder
    QTreeWidgetItem *functionsFolder = new QTreeWidgetItem(dbItem);
    functionsFolder->setText(0, "函数");
    functionsFolder->setData(0, Qt::UserRole, "functions_folder");
    functionsFolder->setIcon(0, QIcon());

    // Add backup folder
    QTreeWidgetItem *backupFolder = new QTreeWidgetItem(dbItem);
    backupFolder->setText(0, "备份");
    backupFolder->setData(0, Qt::UserRole, "backup_folder");
    backupFolder->setIcon(0, QIcon());
}

void DatabaseTreeWidget::setupContextMenu()
{
    // Connection context menu
    connectionMenu = new QMenu(this);
    refreshAction = connectionMenu->addAction("刷新");
    disconnectAction = connectionMenu->addAction("断开连接");

    // Database context menu
    databaseMenu = new QMenu(this);
    newTableAction = databaseMenu->addAction("新建表");
    newViewAction = databaseMenu->addAction("新建视图");
    databaseMenu->addSeparator();
    dropDatabaseAction = databaseMenu->addAction("删除数据库");

    // Table context menu
    tableMenu = new QMenu(this);
    openTableAction = tableMenu->addAction("打开表");
    designTableAction = tableMenu->addAction("设计表");

    // Connect actions
    connect(refreshAction, &QAction::triggered, this, &DatabaseTreeWidget::onRefreshDatabase);
    connect(newTableAction, &QAction::triggered, this, &DatabaseTreeWidget::onNewTable);
    connect(newViewAction, &QAction::triggered, this, &DatabaseTreeWidget::onNewView);
    connect(dropDatabaseAction, &QAction::triggered, this, &DatabaseTreeWidget::onDropDatabase);
}

void DatabaseTreeWidget::contextMenuEvent(QContextMenuEvent *event)
{
    QTreeWidgetItem *item = itemAt(event->pos());
    if (!item) return;

    QString itemType = item->data(0, Qt::UserRole).toString();

    if (itemType == "connection") {
        connectionMenu->exec(event->globalPos());
    } else if (itemType == "database") {
        databaseMenu->exec(event->globalPos());
    } else if (itemType == "table") {
        tableMenu->exec(event->globalPos());
    }
}

void DatabaseTreeWidget::onItemClicked(QTreeWidgetItem *item, int column)
{
    Q_UNUSED(column)
    if (!item) return;

    QString itemType = item->data(0, Qt::UserRole).toString();
    QString itemName = item->text(0);
    QString parentName;

    if (item->parent()) {
        parentName = item->parent()->text(0);
    }

    emit itemSelectionChanged(itemType, itemName, parentName);
}

void DatabaseTreeWidget::onItemDoubleClicked(QTreeWidgetItem *item, int column)
{
    Q_UNUSED(column)
    if (!item) return;

    QString itemType = item->data(0, Qt::UserRole).toString();

    if (itemType == "table") {
        QString tableName = item->text(0);
        QString databaseName = item->parent()->parent()->text(0); // tables_folder -> database
        emit openTable(databaseName, tableName);
    }
}

void DatabaseTreeWidget::onRefreshDatabase()
{
    // Refresh database structure
    setupSampleData();
}

void DatabaseTreeWidget::onNewTable()
{
    // Emit signal or show dialog for new table
}

void DatabaseTreeWidget::onNewView()
{
    // Emit signal or show dialog for new view
}

void DatabaseTreeWidget::onDropDatabase()
{
    // Emit signal or show dialog for drop database
}

QTreeWidgetItem* DatabaseTreeWidget::findConnectionItem(const QString &connectionName)
{
    for (int i = 0; i < topLevelItemCount(); ++i) {
        QTreeWidgetItem *item = topLevelItem(i);
        if (item->text(0) == connectionName &&
            item->data(0, Qt::UserRole).toString() == "connection") {
            return item;
        }
    }
    return nullptr;
}

QTreeWidgetItem* DatabaseTreeWidget::findDatabaseItem(const QString &connectionName, const QString &databaseName)
{
    QTreeWidgetItem *connectionItem = findConnectionItem(connectionName);
    if (!connectionItem) return nullptr;

    for (int i = 0; i < connectionItem->childCount(); ++i) {
        QTreeWidgetItem *dbItem = connectionItem->child(i);
        if (dbItem->text(0) == databaseName &&
            dbItem->data(0, Qt::UserRole).toString() == "database") {
            return dbItem;
        }
    }
    return nullptr;
}