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
#include <QDockWidget>
#include <QListWidget>
#include <QGroupBox>
#include <QLineEdit>
#include <QPushButton>
#include <QComboBox>
#include <QTextEdit>
#include <QFrame>
#include <QGridLayout>
#include <QTranslator>
#include <QActionGroup>

#include "ui/DatabaseTreeWidget.h"
#include "ui/TableListWidget.h"
#include "ui/TableDataWidget.h"
#include "ui/NewConnectionDialog.h"

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void onNewConnection();
    void onOpenQuery();
    void onNewTable();
    void onNewView();
    void onNewFunction();
    void onNewUser();
    void onNewOther();
    void onNewQuery();
    void onNewBackup();
    void onAutoRun();
    void onModel();
    void onNewChartWorkspace();
    void onAbout();
    void onConnectionTreeItemClicked(QTreeWidgetItem *item, int column);
    void onQueryTabChanged(int index);

    // New modular component slots
    void onDatabaseTreeSelectionChanged(const QString &itemType, const QString &itemName, const QString &parentName);
    void onOpenTable(const QString &databaseName, const QString &tableName);
    void onOpenTableFromList(const QString &tableName);
    void onTableSelected(const QString &tableName);
    void onTableDataChanged();

    // Language switching slots
    void switchToEnglish();
    void switchToChinese();

    // Edit menu slots
    void onUndo();
    void onRedo();
    void onCut();
    void onCopy();
    void onPaste();
    void onSelectAll();
    void onFind();
    void onReplace();
    void onGoToLine();

private:
    void setupUI();
    void setupConnectionTree();
    void setupCentralArea();
    void setupPropertiesPanel();
    void addDatabaseItem(QTreeWidgetItem *parent, const QString &dbName);
    void createMenus();
    void createToolBars();
    void createStatusBar();

    // UI Components
    QWidget *centralWidget;
    QSplitter *mainSplitter;
    QSplitter *rightSplitter;

    // Left panel - Database tree
    DatabaseTreeWidget *databaseTree;

    // Central area - Table list and data view
    QTabWidget *centralTabs;
    TableListWidget *tableListWidget;
    TableDataWidget *tableDataWidget;

    // Right panel - Properties dock
    QDockWidget *propertiesDock;
    QWidget *propertiesWidget;
    QVBoxLayout *propertiesLayout;
    QGroupBox *objectInfoGroup;
    QGroupBox *detailsGroup;

    // Property panel components
    QLabel *objectNameLabel;
    QLabel *objectTypeLabel;
    QLabel *charsetLabel;
    QLabel *collationLabel;
    QTextEdit *definitionText;

    // Menus
    QMenu *fileMenu;
    QMenu *editMenu;
    QMenu *viewMenu;
    QMenu *toolsMenu;
    QMenu *helpMenu;
    QMenu *languageMenu;

    // Main toolbar actions
    QAction *newConnectionAction;
    QAction *newQueryAction;
    QAction *newTableAction;
    QAction *newViewAction;
    QAction *newFunctionAction;
    QAction *newUserAction;
    QAction *queryAction;
    QAction *backupAction;
    QAction *autoRunAction;
    QAction *modelAction;
    QAction *reportAction;

    // File menu actions
    QAction *openQueryAction;
    QAction *saveQueryAction;
    QAction *exitAction;
    QAction *aboutAction;

    // Edit menu actions
    QAction *undoAction;
    QAction *redoAction;
    QAction *cutAction;
    QAction *copyAction;
    QAction *pasteAction;
    QAction *selectAllAction;
    QAction *findAction;
    QAction *replaceAction;
    QAction *goToLineAction;

    // Language actions
    QAction *englishAction;
    QAction *chineseAction;
    QActionGroup *languageActionGroup;

    // Translation support
    QTranslator *currentTranslator;

    // Toolbar widgets
    QLineEdit *searchBox;
    QPushButton *openTableBtn;
    QPushButton *designTableBtn;
    QComboBox *exportCombo;
    QComboBox *importCombo;

    // Status bar
    QLabel *statusLabel;
    QLabel *connectionStatusLabel;
};

#endif // MAINWINDOW_H