#ifndef TABLELISTWIDGET_H
#define TABLELISTWIDGET_H

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
#include <QContextMenuEvent>
#include <QMenu>
#include <QAction>

struct TableInfo {
    QString name;
    QString autoIncrement;
    QString modifyDate;
    QString dataLength;
    QString engine;
    int rows;
    QString comment;
};

class TableListWidget : public QWidget
{
    Q_OBJECT

public:
    explicit TableListWidget(QWidget *parent = nullptr);
    ~TableListWidget();

    void setDatabase(const QString &databaseName);
    void loadTables(const QList<TableInfo> &tables);
    void clearTables();
    void addTable(const TableInfo &tableInfo);

signals:
    void tableSelected(const QString &tableName);
    void tableDoubleClicked(const QString &tableName);
    void openTable(const QString &tableName);
    void designTable(const QString &tableName);
    void dropTable(const QString &tableName);
    void refreshTables();

protected:
    void contextMenuEvent(QContextMenuEvent *event) override;

private slots:
    void onTableSelectionChanged();
    void onTableDoubleClicked(int row, int column);
    void onSearchTextChanged(const QString &text);
    void onOpenTableClicked();
    void onDesignTableClicked();
    void onNewTableClicked();
    void onDropTableClicked();
    void onRefreshClicked();
    void onImportClicked();
    void onExportClicked();

private:
    void setupUI();
    void setupToolbar();
    void setupTableView();
    void setupContextMenu();
    void filterTables(const QString &searchText);
    QString getCurrentSelectedTable();

    QVBoxLayout *mainLayout;
    QFrame *toolbarFrame;
    QHBoxLayout *toolbarLayout;
    QTableWidget *tableWidget;

    // Toolbar components
    QToolButton *openTableBtn;
    QToolButton *designTableBtn;
    QToolButton *newTableBtn;
    QToolButton *dropTableBtn;
    QToolButton *importBtn;
    QToolButton *exportBtn;
    QToolButton *refreshBtn;
    QLineEdit *searchEdit;

    // Context menu
    QMenu *contextMenu;
    QAction *openAction;
    QAction *designAction;
    QAction *copyNameAction;
    QAction *dropAction;

    QString currentDatabase;
    QList<TableInfo> allTables;
};

#endif // TABLELISTWIDGET_H