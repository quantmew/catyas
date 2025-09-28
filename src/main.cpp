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
    app.setApplicationName("catyas");
    app.setApplicationVersion("1.0.0");
    app.setOrganizationName("catyas Team");

    MainWindow window;
    window.show();

    return app.exec();
}