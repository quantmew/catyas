#ifndef DATABASETREEWIDGET_H
#define DATABASETREEWIDGET_H

#include <QTreeWidget>
#include <QTreeWidgetItem>
#include <QContextMenuEvent>
#include <QMenu>
#include <QAction>

class DatabaseTreeWidget : public QTreeWidget
{
    Q_OBJECT

public:
    explicit DatabaseTreeWidget(QWidget *parent = nullptr);
    ~DatabaseTreeWidget();

    void setupSampleData();
    void addConnection(const QString &connectionName);
    void addDatabase(const QString &connectionName, const QString &databaseName);

signals:
    void itemSelectionChanged(const QString &itemType, const QString &itemName, const QString &parentName = QString());
    void openTable(const QString &databaseName, const QString &tableName);
    void designTable(const QString &databaseName, const QString &tableName);

protected:
    void contextMenuEvent(QContextMenuEvent *event) override;

private slots:
    void onItemClicked(QTreeWidgetItem *item, int column);
    void onItemDoubleClicked(QTreeWidgetItem *item, int column);
    void onRefreshDatabase();
    void onNewTable();
    void onNewView();
    void onDropDatabase();

private:
    void setupContextMenu();
    void addDatabaseStructure(QTreeWidgetItem *dbItem);
    QTreeWidgetItem* findConnectionItem(const QString &connectionName);
    QTreeWidgetItem* findDatabaseItem(const QString &connectionName, const QString &databaseName);

    QMenu *connectionMenu;
    QMenu *databaseMenu;
    QMenu *tableMenu;
    QMenu *viewMenu;

    QAction *refreshAction;
    QAction *newTableAction;
    QAction *newViewAction;
    QAction *openTableAction;
    QAction *designTableAction;
    QAction *dropDatabaseAction;
    QAction *disconnectAction;
};

#endif // DATABASETREEWIDGET_H