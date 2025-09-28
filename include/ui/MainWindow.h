#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QSplitter>
#include <QTreeWidget>
#include <QTableWidget>
#include <QTabWidget>
#include <QMenuBar>
#include <QStatusBar>
#include <QToolBar>
#include <QAction>
#include <QLabel>

class ConnectionTreeWidget;
class QueryTabWidget;
class DatabaseTableWidget;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void onNewConnection();
    void onOpenQuery();
    void onAbout();

private:
    void setupUI();
    void createMenus();
    void createToolBars();
    void createStatusBar();

    // UI Components
    QWidget *centralWidget;
    QSplitter *mainSplitter;
    QSplitter *rightSplitter;

    // Left panel - Connection tree
    ConnectionTreeWidget *connectionTree;

    // Right top - Query editor tabs
    QueryTabWidget *queryTabs;

    // Right bottom - Result tables
    DatabaseTableWidget *resultTable;

    // Menus
    QMenu *fileMenu;
    QMenu *editMenu;
    QMenu *viewMenu;
    QMenu *toolsMenu;
    QMenu *helpMenu;

    // Actions
    QAction *newConnectionAction;
    QAction *openQueryAction;
    QAction *saveQueryAction;
    QAction *exitAction;
    QAction *aboutAction;

    // Status bar
    QLabel *statusLabel;
    QLabel *connectionStatusLabel;
};

#endif // MAINWINDOW_H