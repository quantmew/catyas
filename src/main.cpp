#include <QApplication>
#include <QMainWindow>
#include <QVBoxLayout>
#include <QWidget>
#include <QMenuBar>
#include <QStatusBar>
#include <QSplitter>
#include <QTreeWidget>
#include <QTableWidget>
#include <QTabWidget>

#include "ui/MainWindow.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setApplicationName("DB Navigator");
    app.setApplicationVersion("1.0.0");
    app.setOrganizationName("DB Navigator Team");

    MainWindow window;
    window.show();

    return app.exec();
}