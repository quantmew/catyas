#ifndef TABLEDATAWIDGET_H
#define TABLEDATAWIDGET_H

#include <QWidget>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QTableWidget>
#include <QTableWidgetItem>
#include <QHeaderView>
#include <QFrame>
#include <QToolButton>
#include <QLineEdit>
#include <QLabel>
#include <QComboBox>
#include <QSpinBox>
#include <QProgressBar>
#include <QSplitter>
#include <QTextEdit>
#include <QContextMenuEvent>
#include <QMenu>
#include <QAction>

struct ColumnInfo {
    QString name;
    QString type;
    bool isPrimaryKey;
    bool allowNull;
    QString defaultValue;
    QString comment;
};

struct TableData {
    QList<ColumnInfo> columns;
    QList<QStringList> rows;
    int totalRows;
    int currentPage;
    int pageSize;
};

class TableDataWidget : public QWidget
{
    Q_OBJECT

public:
    explicit TableDataWidget(QWidget *parent = nullptr);
    ~TableDataWidget();

    void setTable(const QString &databaseName, const QString &tableName);
    void loadTableData(const TableData &data);
    void clearData();
    void setReadOnly(bool readOnly);

signals:
    void dataChanged();
    void refreshRequested();
    void exportRequested();
    void queryRequested(const QString &query);

protected:
    void contextMenuEvent(QContextMenuEvent *event) override;

private slots:
    void onCellChanged(int row, int column);
    void onCellDoubleClicked(int row, int column);
    void onRefreshClicked();
    void onAddRowClicked();
    void onDeleteRowClicked();
    void onSaveChangesClicked();
    void onDiscardChangesClicked();
    void onExportClicked();
    void onFirstPageClicked();
    void onPrevPageClicked();
    void onNextPageClicked();
    void onLastPageClicked();
    void onPageSizeChanged(int pageSize);
    void onGoToPageClicked();
    void onFilterTextChanged();
    void onCopyCell();
    void onPasteCell();
    void onSetNull();

private:
    void setupUI();
    void setupToolbar();
    void setupDataTable();
    void setupPaginationBar();
    void setupContextMenu();
    void updatePaginationInfo();
    void loadSampleData();
    QString getCurrentCellValue();
    void setCellValue(const QString &value);

    QVBoxLayout *mainLayout;
    QFrame *toolbarFrame;
    QHBoxLayout *toolbarLayout;
    QTableWidget *dataTable;
    QFrame *paginationFrame;
    QHBoxLayout *paginationLayout;

    // Toolbar components
    QToolButton *refreshBtn;
    QToolButton *addRowBtn;
    QToolButton *deleteRowBtn;
    QToolButton *saveBtn;
    QToolButton *discardBtn;
    QToolButton *exportBtn;
    QLineEdit *filterEdit;
    QLabel *statusLabel;

    // Pagination components
    QToolButton *firstPageBtn;
    QToolButton *prevPageBtn;
    QToolButton *nextPageBtn;
    QToolButton *lastPageBtn;
    QLabel *pageInfoLabel;
    QComboBox *pageSizeCombo;
    QSpinBox *pageSpinBox;
    QToolButton *goToPageBtn;

    // Context menu
    QMenu *contextMenu;
    QAction *copyAction;
    QAction *pasteAction;
    QAction *setNullAction;
    QAction *editCellAction;

    QString currentDatabase;
    QString currentTable;
    TableData tableData;
    bool isReadOnly;
    bool hasChanges;
};

#endif // TABLEDATAWIDGET_H