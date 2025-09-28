#include "ui/TableDataWidget.h"
#include <QApplication>
#include <QClipboard>
#include <QMessageBox>
#include <QDateTime>

TableDataWidget::TableDataWidget(QWidget *parent)
    : QWidget(parent)
    , mainLayout(nullptr)
    , toolbarFrame(nullptr)
    , dataTable(nullptr)
    , paginationFrame(nullptr)
    , contextMenu(nullptr)
    , isReadOnly(false)
    , hasChanges(false)
{
    setupUI();
    setupContextMenu();
}

TableDataWidget::~TableDataWidget()
{
}

void TableDataWidget::setupUI()
{
    mainLayout = new QVBoxLayout(this);
    mainLayout->setContentsMargins(0, 0, 0, 0);
    mainLayout->setSpacing(0);

    setupToolbar();
    setupDataTable();
    setupPaginationBar();

    setStyleSheet(
        "QFrame#toolbarFrame, QFrame#paginationFrame { "
        "   background: #f8f8f8; "
        "   border: 1px solid #d0d0d0; "
        "}"
        "QFrame#toolbarFrame { border-bottom: none; }"
        "QFrame#paginationFrame { border-top: none; }"
        "QTableWidget { "
        "   background-color: white; "
        "   border: 1px solid #d0d0d0; "
        "   border-top: none; "
        "   border-bottom: none; "
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

void TableDataWidget::setupToolbar()
{
    toolbarFrame = new QFrame();
    toolbarFrame->setObjectName("toolbarFrame");
    toolbarFrame->setFixedHeight(40);
    toolbarLayout = new QHBoxLayout(toolbarFrame);
    toolbarLayout->setContentsMargins(8, 4, 8, 4);
    toolbarLayout->setSpacing(4);

    // Create toolbar buttons
    QString buttonStyle =
        "QToolButton { "
        "   background: transparent; "
        "   border: 1px solid transparent; "
        "   padding: 4px 8px; "
        "   font-size: 12px; "
        "   min-width: 60px; "
        "}"
        "QToolButton:hover { "
        "   background: #e0e0e0; "
        "   border: 1px solid #c0c0c0; "
        "}"
        "QToolButton:pressed { "
        "   background: #d0d0d0; "
        "}"
        "QToolButton:disabled { "
        "   color: #999999; "
        "   background: transparent; "
        "}";

    refreshBtn = new QToolButton();
    refreshBtn->setText("刷新");
    refreshBtn->setToolTip("刷新数据");
    refreshBtn->setStyleSheet(buttonStyle);

    addRowBtn = new QToolButton();
    addRowBtn->setText("添加行");
    addRowBtn->setToolTip("添加新行");
    addRowBtn->setStyleSheet(buttonStyle);

    deleteRowBtn = new QToolButton();
    deleteRowBtn->setText("删除行");
    deleteRowBtn->setToolTip("删除选中行");
    deleteRowBtn->setStyleSheet(buttonStyle);

    saveBtn = new QToolButton();
    saveBtn->setText("保存");
    saveBtn->setToolTip("保存更改");
    saveBtn->setStyleSheet(buttonStyle);
    saveBtn->setEnabled(false);

    discardBtn = new QToolButton();
    discardBtn->setText("取消");
    discardBtn->setToolTip("取消更改");
    discardBtn->setStyleSheet(buttonStyle);
    discardBtn->setEnabled(false);

    exportBtn = new QToolButton();
    exportBtn->setText("导出");
    exportBtn->setToolTip("导出数据");
    exportBtn->setStyleSheet(buttonStyle);

    // Filter box
    filterEdit = new QLineEdit();
    filterEdit->setPlaceholderText("过滤数据...");
    filterEdit->setMaximumWidth(200);
    filterEdit->setStyleSheet(
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

    // Status label
    statusLabel = new QLabel("准备就绪");
    statusLabel->setStyleSheet("QLabel { color: #666666; font-size: 12px; }");

    // Add components to toolbar
    toolbarLayout->addWidget(refreshBtn);
    toolbarLayout->addWidget(addRowBtn);
    toolbarLayout->addWidget(deleteRowBtn);
    toolbarLayout->addWidget(saveBtn);
    toolbarLayout->addWidget(discardBtn);
    toolbarLayout->addWidget(exportBtn);
    toolbarLayout->addStretch();
    toolbarLayout->addWidget(filterEdit);
    toolbarLayout->addWidget(statusLabel);

    mainLayout->addWidget(toolbarFrame);

    // Connect signals
    connect(refreshBtn, &QToolButton::clicked, this, &TableDataWidget::onRefreshClicked);
    connect(addRowBtn, &QToolButton::clicked, this, &TableDataWidget::onAddRowClicked);
    connect(deleteRowBtn, &QToolButton::clicked, this, &TableDataWidget::onDeleteRowClicked);
    connect(saveBtn, &QToolButton::clicked, this, &TableDataWidget::onSaveChangesClicked);
    connect(discardBtn, &QToolButton::clicked, this, &TableDataWidget::onDiscardChangesClicked);
    connect(exportBtn, &QToolButton::clicked, this, &TableDataWidget::onExportClicked);
    connect(filterEdit, &QLineEdit::textChanged, this, &TableDataWidget::onFilterTextChanged);
}

void TableDataWidget::setupDataTable()
{
    dataTable = new QTableWidget();
    dataTable->setAlternatingRowColors(true);
    dataTable->setSelectionBehavior(QAbstractItemView::SelectItems);
    dataTable->setSelectionMode(QAbstractItemView::ExtendedSelection);
    dataTable->setSortingEnabled(false); // Disable sorting for data editing
    dataTable->verticalHeader()->setVisible(true);

    // Enable editing
    dataTable->setEditTriggers(QAbstractItemView::DoubleClicked | QAbstractItemView::EditKeyPressed);

    mainLayout->addWidget(dataTable);

    connect(dataTable, &QTableWidget::itemChanged, this, &TableDataWidget::onCellChanged);
    connect(dataTable, &QTableWidget::cellDoubleClicked, this, &TableDataWidget::onCellDoubleClicked);
}

void TableDataWidget::setupPaginationBar()
{
    paginationFrame = new QFrame();
    paginationFrame->setObjectName("paginationFrame");
    paginationFrame->setFixedHeight(32);
    paginationLayout = new QHBoxLayout(paginationFrame);
    paginationLayout->setContentsMargins(8, 4, 8, 4);
    paginationLayout->setSpacing(4);

    QString btnStyle =
        "QToolButton { "
        "   background: transparent; "
        "   border: 1px solid #c0c0c0; "
        "   padding: 2px 6px; "
        "   font-size: 11px; "
        "   min-width: 20px; "
        "}"
        "QToolButton:hover { "
        "   background: #e0e0e0; "
        "}"
        "QToolButton:pressed { "
        "   background: #d0d0d0; "
        "}"
        "QToolButton:disabled { "
        "   color: #999999; "
        "   background: #f5f5f5; "
        "}";

    // Navigation buttons
    firstPageBtn = new QToolButton();
    firstPageBtn->setText("<<");
    firstPageBtn->setToolTip("第一页");
    firstPageBtn->setStyleSheet(btnStyle);

    prevPageBtn = new QToolButton();
    prevPageBtn->setText("<");
    prevPageBtn->setToolTip("上一页");
    prevPageBtn->setStyleSheet(btnStyle);

    nextPageBtn = new QToolButton();
    nextPageBtn->setText(">");
    nextPageBtn->setToolTip("下一页");
    nextPageBtn->setStyleSheet(btnStyle);

    lastPageBtn = new QToolButton();
    lastPageBtn->setText(">>");
    lastPageBtn->setToolTip("最后一页");
    lastPageBtn->setStyleSheet(btnStyle);

    // Page info
    pageInfoLabel = new QLabel("第 1 页, 共 1 页");
    pageInfoLabel->setStyleSheet("QLabel { font-size: 11px; color: #666666; }");

    // Page size combo
    pageSizeCombo = new QComboBox();
    pageSizeCombo->addItems({"100", "500", "1000", "2000"});
    pageSizeCombo->setCurrentText("1000");
    pageSizeCombo->setStyleSheet(
        "QComboBox { "
        "   padding: 2px 4px; "
        "   border: 1px solid #c0c0c0; "
        "   font-size: 11px; "
        "   min-width: 60px; "
        "}"
    );

    // Go to page
    pageSpinBox = new QSpinBox();
    pageSpinBox->setMinimum(1);
    pageSpinBox->setValue(1);
    pageSpinBox->setStyleSheet(
        "QSpinBox { "
        "   padding: 2px; "
        "   border: 1px solid #c0c0c0; "
        "   font-size: 11px; "
        "   min-width: 50px; "
        "}"
    );

    goToPageBtn = new QToolButton();
    goToPageBtn->setText("转到");
    goToPageBtn->setStyleSheet(btnStyle);

    // Add components to pagination bar
    paginationLayout->addWidget(firstPageBtn);
    paginationLayout->addWidget(prevPageBtn);
    paginationLayout->addWidget(nextPageBtn);
    paginationLayout->addWidget(lastPageBtn);
    paginationLayout->addWidget(new QLabel("|"));
    paginationLayout->addWidget(pageInfoLabel);
    paginationLayout->addWidget(new QLabel("|"));
    paginationLayout->addWidget(new QLabel("每页:"));
    paginationLayout->addWidget(pageSizeCombo);
    paginationLayout->addWidget(new QLabel("行"));
    paginationLayout->addStretch();
    paginationLayout->addWidget(new QLabel("转到页:"));
    paginationLayout->addWidget(pageSpinBox);
    paginationLayout->addWidget(goToPageBtn);

    mainLayout->addWidget(paginationFrame);

    // Connect signals
    connect(firstPageBtn, &QToolButton::clicked, this, &TableDataWidget::onFirstPageClicked);
    connect(prevPageBtn, &QToolButton::clicked, this, &TableDataWidget::onPrevPageClicked);
    connect(nextPageBtn, &QToolButton::clicked, this, &TableDataWidget::onNextPageClicked);
    connect(lastPageBtn, &QToolButton::clicked, this, &TableDataWidget::onLastPageClicked);
    connect(pageSizeCombo, QOverload<int>::of(&QComboBox::currentIndexChanged),
            this, &TableDataWidget::onPageSizeChanged);
    connect(goToPageBtn, &QToolButton::clicked, this, &TableDataWidget::onGoToPageClicked);
}

void TableDataWidget::setupContextMenu()
{
    contextMenu = new QMenu(this);

    copyAction = contextMenu->addAction("复制");
    pasteAction = contextMenu->addAction("粘贴");
    contextMenu->addSeparator();
    setNullAction = contextMenu->addAction("设为 NULL");
    contextMenu->addSeparator();
    editCellAction = contextMenu->addAction("编辑单元格");

    connect(copyAction, &QAction::triggered, this, &TableDataWidget::onCopyCell);
    connect(pasteAction, &QAction::triggered, this, &TableDataWidget::onPasteCell);
    connect(setNullAction, &QAction::triggered, this, &TableDataWidget::onSetNull);
}

void TableDataWidget::setTable(const QString &databaseName, const QString &tableName)
{
    currentDatabase = databaseName;
    currentTable = tableName;

    statusLabel->setText(QString("加载表: %1.%2").arg(databaseName, tableName));

    clearData();
    loadSampleData();
}

void TableDataWidget::loadTableData(const TableData &data)
{
    tableData = data;

    // Setup columns
    dataTable->setColumnCount(data.columns.size());
    QStringList headers;
    for (const ColumnInfo &col : data.columns) {
        QString header = col.name;
        if (col.isPrimaryKey) {
            header += " (PK)";
        }
        headers << header;
    }
    dataTable->setHorizontalHeaderLabels(headers);

    // Load data rows
    dataTable->setRowCount(data.rows.size());
    for (int row = 0; row < data.rows.size(); ++row) {
        const QStringList &rowData = data.rows[row];
        for (int col = 0; col < rowData.size() && col < data.columns.size(); ++col) {
            QTableWidgetItem *item = new QTableWidgetItem(rowData[col]);

            // Set read-only for primary key columns
            if (data.columns[col].isPrimaryKey) {
                item->setFlags(item->flags() & ~Qt::ItemIsEditable);
                item->setBackground(QColor(240, 240, 240));
            }

            dataTable->setItem(row, col, item);
        }
    }

    dataTable->resizeColumnsToContents();
    updatePaginationInfo();

    statusLabel->setText(QString("已加载 %1 行数据").arg(data.rows.size()));
}

void TableDataWidget::clearData()
{
    dataTable->clear();
    dataTable->setRowCount(0);
    dataTable->setColumnCount(0);
    hasChanges = false;
    saveBtn->setEnabled(false);
    discardBtn->setEnabled(false);
}

void TableDataWidget::setReadOnly(bool readOnly)
{
    isReadOnly = readOnly;
    addRowBtn->setEnabled(!readOnly);
    deleteRowBtn->setEnabled(!readOnly);
    saveBtn->setEnabled(!readOnly && hasChanges);
    discardBtn->setEnabled(!readOnly && hasChanges);

    if (readOnly) {
        dataTable->setEditTriggers(QAbstractItemView::NoEditTriggers);
    } else {
        dataTable->setEditTriggers(QAbstractItemView::DoubleClicked | QAbstractItemView::EditKeyPressed);
    }
}

void TableDataWidget::contextMenuEvent(QContextMenuEvent *event)
{
    if (dataTable->itemAt(dataTable->mapFromParent(event->pos()))) {
        pasteAction->setEnabled(!isReadOnly);
        setNullAction->setEnabled(!isReadOnly);
        contextMenu->exec(event->globalPos());
    }
}

void TableDataWidget::loadSampleData()
{
    if (currentTable == "CSI_WEIGHT_MONTH") {
        TableData sampleData;

        // Setup columns
        ColumnInfo idCol = {"id", "int", true, false, "", "主键"};
        ColumnInfo indexCol = {"index_code", "varchar(20)", false, false, "", "指数代码"};
        ColumnInfo stockCol = {"stock_code", "varchar(20)", false, false, "", "股票代码"};
        ColumnInfo dateCol = {"end_date", "date", false, false, "", "截止日期"};
        ColumnInfo weightCol = {"weight", "decimal(10,4)", false, true, "0.0000", "权重"};
        ColumnInfo statusCol = {"status", "int", false, false, "0", "状态"};
        ColumnInfo addTimeCol = {"addTime", "datetime", false, false, "CURRENT_TIMESTAMP", "添加时间"};
        ColumnInfo modTimeCol = {"modTime", "datetime", false, false, "CURRENT_TIMESTAMP", "修改时间"};

        sampleData.columns << idCol << indexCol << stockCol << dateCol << weightCol << statusCol << addTimeCol << modTimeCol;

        // Add sample rows
        for (int i = 1; i <= 40; ++i) {
            QStringList row;
            row << QString::number(i);
            row << "000010.CSI";
            row << "600000.XSHG";
            row << QString("2011-%1-%2").arg(QString::number(i % 12 + 1).rightJustified(2, '0')).arg(QString::number(i % 28 + 1).rightJustified(2, '0'));
            row << QString::number(2.5000 + (i % 10) * 0.1000, 'f', 4);
            row << "0";
            row << "2024-02-27 10:56:06";
            row << "2024-02-27 10:56:06";
            sampleData.rows << row;
        }

        sampleData.totalRows = 31030791;
        sampleData.currentPage = 1;
        sampleData.pageSize = 1000;

        loadTableData(sampleData);
    }
}

void TableDataWidget::updatePaginationInfo()
{
    int totalPages = (tableData.totalRows + tableData.pageSize - 1) / tableData.pageSize;
    pageInfoLabel->setText(QString("第 %1 页, 共 %2 页").arg(tableData.currentPage).arg(totalPages));

    firstPageBtn->setEnabled(tableData.currentPage > 1);
    prevPageBtn->setEnabled(tableData.currentPage > 1);
    nextPageBtn->setEnabled(tableData.currentPage < totalPages);
    lastPageBtn->setEnabled(tableData.currentPage < totalPages);

    pageSpinBox->setMaximum(totalPages);
    pageSpinBox->setValue(tableData.currentPage);
}

void TableDataWidget::onCellChanged(int row, int column)
{
    Q_UNUSED(row)
    Q_UNUSED(column)

    if (!isReadOnly) {
        hasChanges = true;
        saveBtn->setEnabled(true);
        discardBtn->setEnabled(true);
        statusLabel->setText("数据已修改");
        emit dataChanged();
    }
}

void TableDataWidget::onCellDoubleClicked(int row, int column)
{
    Q_UNUSED(row)
    Q_UNUSED(column)
    // Handle double click if needed
}

void TableDataWidget::onRefreshClicked()
{
    emit refreshRequested();
    loadSampleData(); // Reload sample data for now
}

void TableDataWidget::onAddRowClicked()
{
    if (isReadOnly) return;

    int newRow = dataTable->rowCount();
    dataTable->insertRow(newRow);

    // Set default values for new row
    for (int col = 0; col < dataTable->columnCount(); ++col) {
        QTableWidgetItem *item = new QTableWidgetItem("");
        dataTable->setItem(newRow, col, item);
    }

    hasChanges = true;
    saveBtn->setEnabled(true);
    discardBtn->setEnabled(true);
    statusLabel->setText("添加了新行");
}

void TableDataWidget::onDeleteRowClicked()
{
    if (isReadOnly) return;

    int currentRow = dataTable->currentRow();
    if (currentRow >= 0) {
        dataTable->removeRow(currentRow);
        hasChanges = true;
        saveBtn->setEnabled(true);
        discardBtn->setEnabled(true);
        statusLabel->setText("删除了行");
    }
}

void TableDataWidget::onSaveChangesClicked()
{
    hasChanges = false;
    saveBtn->setEnabled(false);
    discardBtn->setEnabled(false);
    statusLabel->setText("更改已保存");
    // Here you would save changes to database
}

void TableDataWidget::onDiscardChangesClicked()
{
    loadSampleData(); // Reload data to discard changes
    hasChanges = false;
    saveBtn->setEnabled(false);
    discardBtn->setEnabled(false);
    statusLabel->setText("更改已取消");
}

void TableDataWidget::onExportClicked()
{
    emit exportRequested();
}

void TableDataWidget::onFirstPageClicked()
{
    tableData.currentPage = 1;
    updatePaginationInfo();
    loadSampleData();
}

void TableDataWidget::onPrevPageClicked()
{
    if (tableData.currentPage > 1) {
        tableData.currentPage--;
        updatePaginationInfo();
        loadSampleData();
    }
}

void TableDataWidget::onNextPageClicked()
{
    int totalPages = (tableData.totalRows + tableData.pageSize - 1) / tableData.pageSize;
    if (tableData.currentPage < totalPages) {
        tableData.currentPage++;
        updatePaginationInfo();
        loadSampleData();
    }
}

void TableDataWidget::onLastPageClicked()
{
    int totalPages = (tableData.totalRows + tableData.pageSize - 1) / tableData.pageSize;
    tableData.currentPage = totalPages;
    updatePaginationInfo();
    loadSampleData();
}

void TableDataWidget::onPageSizeChanged(int index)
{
    Q_UNUSED(index)
    tableData.pageSize = pageSizeCombo->currentText().toInt();
    tableData.currentPage = 1;
    updatePaginationInfo();
    loadSampleData();
}

void TableDataWidget::onGoToPageClicked()
{
    int page = pageSpinBox->value();
    int totalPages = (tableData.totalRows + tableData.pageSize - 1) / tableData.pageSize;

    if (page >= 1 && page <= totalPages) {
        tableData.currentPage = page;
        updatePaginationInfo();
        loadSampleData();
    }
}

void TableDataWidget::onFilterTextChanged()
{
    QString filterText = filterEdit->text();
    // Implement filtering logic here
    Q_UNUSED(filterText)
}

void TableDataWidget::onCopyCell()
{
    QString value = getCurrentCellValue();
    if (!value.isEmpty()) {
        QApplication::clipboard()->setText(value);
    }
}

void TableDataWidget::onPasteCell()
{
    if (isReadOnly) return;

    QString value = QApplication::clipboard()->text();
    setCellValue(value);
}

void TableDataWidget::onSetNull()
{
    if (isReadOnly) return;

    setCellValue("NULL");
}

QString TableDataWidget::getCurrentCellValue()
{
    QTableWidgetItem *item = dataTable->currentItem();
    if (item) {
        return item->text();
    }
    return QString();
}

void TableDataWidget::setCellValue(const QString &value)
{
    QTableWidgetItem *item = dataTable->currentItem();
    if (item && !isReadOnly) {
        item->setText(value);
        hasChanges = true;
        saveBtn->setEnabled(true);
        discardBtn->setEnabled(true);
        statusLabel->setText("数据已修改");
    }
}