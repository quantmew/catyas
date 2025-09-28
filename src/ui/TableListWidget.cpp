#include "ui/TableListWidget.h"
#include <QApplication>
#include <QClipboard>
#include <QMessageBox>

TableListWidget::TableListWidget(QWidget *parent)
    : QWidget(parent)
    , mainLayout(nullptr)
    , toolbarFrame(nullptr)
    , tableWidget(nullptr)
    , contextMenu(nullptr)
{
    setupUI();
    setupContextMenu();
}

TableListWidget::~TableListWidget()
{
}

void TableListWidget::setupUI()
{
    mainLayout = new QVBoxLayout(this);
    mainLayout->setContentsMargins(0, 0, 0, 0);
    mainLayout->setSpacing(0);

    setupToolbar();
    setupTableView();

    setStyleSheet(
        "QFrame#toolbarFrame { "
        "   background: #f8f8f8; "
        "   border: 1px solid #d0d0d0; "
        "   border-bottom: none; "
        "}"
        "QTableWidget { "
        "   background-color: white; "
        "   border: 1px solid #d0d0d0; "
        "   gridline-color: #e0e0e0; "
        "   font-size: 13px; "
        "}"
        "QHeaderView::section { "
        "   background-color: #f0f0f0; "
        "   padding: 6px; "
        "   border: 1px solid #d0d0d0; "
        "   font-weight: bold; "
        "}"
        "QTableWidget::item { "
        "   padding: 4px; "
        "   border: none; "
        "}"
        "QTableWidget::item:selected { "
        "   background-color: #0078d4; "
        "   color: white; "
        "}"
        "QTableWidget::item:hover { "
        "   background-color: #e5f3ff; "
        "}"
    );
}

void TableListWidget::setupToolbar()
{
    toolbarFrame = new QFrame();
    toolbarFrame->setObjectName("toolbarFrame");
    toolbarFrame->setFixedHeight(40);
    toolbarLayout = new QHBoxLayout(toolbarFrame);
    toolbarLayout->setContentsMargins(8, 4, 8, 4);
    toolbarLayout->setSpacing(4);

    // Create toolbar buttons
    openTableBtn = new QToolButton();
    openTableBtn->setText("打开表");
    openTableBtn->setToolTip("打开选中的表");
    openTableBtn->setStyleSheet(
        "QToolButton { "
        "   background: transparent; "
        "   border: 1px solid transparent; "
        "   padding: 4px 8px; "
        "   font-size: 12px; "
        "}"
        "QToolButton:hover { "
        "   background: #e0e0e0; "
        "   border: 1px solid #c0c0c0; "
        "}"
        "QToolButton:pressed { "
        "   background: #d0d0d0; "
        "}"
    );

    designTableBtn = new QToolButton();
    designTableBtn->setText("设计表");
    designTableBtn->setToolTip("设计选中的表");
    designTableBtn->setStyleSheet(openTableBtn->styleSheet());

    newTableBtn = new QToolButton();
    newTableBtn->setText("新建表");
    newTableBtn->setToolTip("创建新表");
    newTableBtn->setStyleSheet(openTableBtn->styleSheet());

    dropTableBtn = new QToolButton();
    dropTableBtn->setText("删除表");
    dropTableBtn->setToolTip("删除选中的表");
    dropTableBtn->setStyleSheet(openTableBtn->styleSheet());

    importBtn = new QToolButton();
    importBtn->setText("导入向导");
    importBtn->setToolTip("导入数据向导");
    importBtn->setStyleSheet(openTableBtn->styleSheet());

    exportBtn = new QToolButton();
    exportBtn->setText("导出向导");
    exportBtn->setToolTip("导出数据向导");
    exportBtn->setStyleSheet(openTableBtn->styleSheet());

    refreshBtn = new QToolButton();
    refreshBtn->setText("刷新");
    refreshBtn->setToolTip("刷新表列表");
    refreshBtn->setStyleSheet(openTableBtn->styleSheet());

    // Search box
    searchEdit = new QLineEdit();
    searchEdit->setPlaceholderText("搜索表...");
    searchEdit->setMaximumWidth(200);
    searchEdit->setStyleSheet(
        "QLineEdit { "
        "   padding: 4px; "
        "   border: 1px solid #c0c0c0; "
        "   border-radius: 3px; "
        "   font-size: 12px; "
        "}"
        "QLineEdit:focus { "
        "   border: 2px solid #0078d4; "
        "}"
    );

    // Add buttons to toolbar
    toolbarLayout->addWidget(openTableBtn);
    toolbarLayout->addWidget(designTableBtn);
    toolbarLayout->addWidget(newTableBtn);
    toolbarLayout->addWidget(dropTableBtn);
    toolbarLayout->addWidget(importBtn);
    toolbarLayout->addWidget(exportBtn);
    toolbarLayout->addWidget(refreshBtn);
    toolbarLayout->addStretch();
    toolbarLayout->addWidget(searchEdit);

    mainLayout->addWidget(toolbarFrame);

    // Connect signals
    connect(openTableBtn, &QToolButton::clicked, this, &TableListWidget::onOpenTableClicked);
    connect(designTableBtn, &QToolButton::clicked, this, &TableListWidget::onDesignTableClicked);
    connect(newTableBtn, &QToolButton::clicked, this, &TableListWidget::onNewTableClicked);
    connect(dropTableBtn, &QToolButton::clicked, this, &TableListWidget::onDropTableClicked);
    connect(refreshBtn, &QToolButton::clicked, this, &TableListWidget::onRefreshClicked);
    connect(importBtn, &QToolButton::clicked, this, &TableListWidget::onImportClicked);
    connect(exportBtn, &QToolButton::clicked, this, &TableListWidget::onExportClicked);
    connect(searchEdit, &QLineEdit::textChanged, this, &TableListWidget::onSearchTextChanged);
}

void TableListWidget::setupTableView()
{
    tableWidget = new QTableWidget();
    tableWidget->setColumnCount(7);

    QStringList headers;
    headers << "名" << "自动编..." << "修改日期" << "数据长度" << "引擎" << "行" << "注释";
    tableWidget->setHorizontalHeaderLabels(headers);

    // Configure table properties
    tableWidget->setAlternatingRowColors(true);
    tableWidget->setSelectionBehavior(QAbstractItemView::SelectRows);
    tableWidget->setSelectionMode(QAbstractItemView::SingleSelection);
    tableWidget->setSortingEnabled(true);
    tableWidget->verticalHeader()->setVisible(false);

    // Set column widths
    QHeaderView *header = tableWidget->horizontalHeader();
    header->setStretchLastSection(true);
    header->resizeSection(0, 200);  // Name
    header->resizeSection(1, 80);   // Auto increment
    header->resizeSection(2, 150);  // Modify date
    header->resizeSection(3, 100);  // Data length
    header->resizeSection(4, 80);   // Engine
    header->resizeSection(5, 80);   // Rows

    mainLayout->addWidget(tableWidget);

    // Connect signals
    connect(tableWidget, &QTableWidget::itemSelectionChanged,
            this, &TableListWidget::onTableSelectionChanged);
    connect(tableWidget, &QTableWidget::cellDoubleClicked,
            this, &TableListWidget::onTableDoubleClicked);
}

void TableListWidget::setupContextMenu()
{
    contextMenu = new QMenu(this);

    openAction = contextMenu->addAction("打开表");
    designAction = contextMenu->addAction("设计表");
    contextMenu->addSeparator();
    copyNameAction = contextMenu->addAction("复制表名");
    contextMenu->addSeparator();
    dropAction = contextMenu->addAction("删除表");

    connect(openAction, &QAction::triggered, this, &TableListWidget::onOpenTableClicked);
    connect(designAction, &QAction::triggered, this, &TableListWidget::onDesignTableClicked);
    connect(copyNameAction, &QAction::triggered, [this]() {
        QString tableName = getCurrentSelectedTable();
        if (!tableName.isEmpty()) {
            QApplication::clipboard()->setText(tableName);
        }
    });
    connect(dropAction, &QAction::triggered, this, &TableListWidget::onDropTableClicked);
}

void TableListWidget::setDatabase(const QString &databaseName)
{
    currentDatabase = databaseName;
    clearTables();

    // Load sample data for finance database
    if (databaseName == "finance") {
        QList<TableInfo> sampleTables;

        TableInfo table1 = {"CSI_WEIGHT_MONTH", "0", "2025-09-28 17:31:00", "2043904 KB", "InnoDB", 31030791, ""};
        TableInfo table2 = {"FINANCE_BALANCE_SHEET", "0", "2025-09-28 17:31:04", "6672 KB", "InnoDB", 9630, ""};
        TableInfo table3 = {"FINANCE_BALANCE_SHEET_PARENT", "0", "2025-09-28 17:31:06", "5648 KB", "InnoDB", 7978, ""};
        TableInfo table4 = {"FINANCE_CASHFLOW_STATEMENT", "0", "2025-09-28 17:31:08", "6672 KB", "InnoDB", 9192, ""};
        TableInfo table5 = {"FINANCE_INCOME_STATEMENT", "0", "2025-09-28 17:31:13", "5648 KB", "InnoDB", 9445, ""};
        TableInfo table6 = {"FUND_DIVIDEND", "0", "2025-09-28 17:31:27", "14864 KB", "InnoDB", 52061, ""};
        TableInfo table7 = {"FUND_FIN_INDICATOR", "0", "2025-09-28 17:33:57", "187104 KB", "InnoDB", 727474, ""};

        sampleTables << table1 << table2 << table3 << table4 << table5 << table6 << table7;
        loadTables(sampleTables);
    }
}

void TableListWidget::loadTables(const QList<TableInfo> &tables)
{
    allTables = tables;
    clearTables();

    tableWidget->setRowCount(tables.size());

    for (int i = 0; i < tables.size(); ++i) {
        const TableInfo &table = tables[i];

        tableWidget->setItem(i, 0, new QTableWidgetItem(table.name));
        tableWidget->setItem(i, 1, new QTableWidgetItem(table.autoIncrement));
        tableWidget->setItem(i, 2, new QTableWidgetItem(table.modifyDate));
        tableWidget->setItem(i, 3, new QTableWidgetItem(table.dataLength));
        tableWidget->setItem(i, 4, new QTableWidgetItem(table.engine));
        tableWidget->setItem(i, 5, new QTableWidgetItem(QString::number(table.rows)));
        tableWidget->setItem(i, 6, new QTableWidgetItem(table.comment));

        // Set row data for easy access
        tableWidget->item(i, 0)->setData(Qt::UserRole, table.name);
    }

    tableWidget->resizeColumnsToContents();
}

void TableListWidget::clearTables()
{
    tableWidget->setRowCount(0);
    allTables.clear();
}

void TableListWidget::addTable(const TableInfo &tableInfo)
{
    allTables.append(tableInfo);

    int row = tableWidget->rowCount();
    tableWidget->insertRow(row);

    tableWidget->setItem(row, 0, new QTableWidgetItem(tableInfo.name));
    tableWidget->setItem(row, 1, new QTableWidgetItem(tableInfo.autoIncrement));
    tableWidget->setItem(row, 2, new QTableWidgetItem(tableInfo.modifyDate));
    tableWidget->setItem(row, 3, new QTableWidgetItem(tableInfo.dataLength));
    tableWidget->setItem(row, 4, new QTableWidgetItem(tableInfo.engine));
    tableWidget->setItem(row, 5, new QTableWidgetItem(QString::number(tableInfo.rows)));
    tableWidget->setItem(row, 6, new QTableWidgetItem(tableInfo.comment));

    tableWidget->item(row, 0)->setData(Qt::UserRole, tableInfo.name);
}

void TableListWidget::contextMenuEvent(QContextMenuEvent *event)
{
    if (tableWidget->itemAt(tableWidget->mapFromParent(event->pos()))) {
        contextMenu->exec(event->globalPos());
    }
}

void TableListWidget::onTableSelectionChanged()
{
    QString tableName = getCurrentSelectedTable();
    if (!tableName.isEmpty()) {
        emit tableSelected(tableName);
    }
}

void TableListWidget::onTableDoubleClicked(int row, int column)
{
    Q_UNUSED(column)
    if (row >= 0 && row < tableWidget->rowCount()) {
        QString tableName = tableWidget->item(row, 0)->text();
        emit tableDoubleClicked(tableName);
        emit openTable(tableName);
    }
}

void TableListWidget::onSearchTextChanged(const QString &text)
{
    filterTables(text);
}

void TableListWidget::onOpenTableClicked()
{
    QString tableName = getCurrentSelectedTable();
    if (!tableName.isEmpty()) {
        emit openTable(tableName);
    }
}

void TableListWidget::onDesignTableClicked()
{
    QString tableName = getCurrentSelectedTable();
    if (!tableName.isEmpty()) {
        emit designTable(tableName);
    }
}

void TableListWidget::onNewTableClicked()
{
    // Will be implemented later
    QMessageBox::information(this, "新建表", "新建表功能将在后续实现");
}

void TableListWidget::onDropTableClicked()
{
    QString tableName = getCurrentSelectedTable();
    if (!tableName.isEmpty()) {
        emit dropTable(tableName);
    }
}

void TableListWidget::onRefreshClicked()
{
    emit refreshTables();
}

void TableListWidget::onImportClicked()
{
    QMessageBox::information(this, "导入", "导入功能将在后续实现");
}

void TableListWidget::onExportClicked()
{
    QMessageBox::information(this, "导出", "导出功能将在后续实现");
}

void TableListWidget::filterTables(const QString &searchText)
{
    for (int i = 0; i < tableWidget->rowCount(); ++i) {
        QTableWidgetItem *item = tableWidget->item(i, 0);
        if (item) {
            bool match = item->text().contains(searchText, Qt::CaseInsensitive);
            tableWidget->setRowHidden(i, !match);
        }
    }
}

QString TableListWidget::getCurrentSelectedTable()
{
    int currentRow = tableWidget->currentRow();
    if (currentRow >= 0 && currentRow < tableWidget->rowCount()) {
        QTableWidgetItem *item = tableWidget->item(currentRow, 0);
        if (item) {
            return item->text();
        }
    }
    return QString();
}