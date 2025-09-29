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
#include <QTranslator>
#include <QLocale>
#include <QDir>

#include "ui/MainWindow.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setApplicationName("catyas");
    app.setApplicationVersion("1.0.0");
    app.setOrganizationName("catyas Team");

    // Setup internationalization
    QTranslator translator;
    QString locale = QLocale::system().name();

    // Try to load translation file
    bool translationLoaded = false;

    // First try to load from resources
    if (translator.load(":/translations/catyas_" + locale)) {
        translationLoaded = true;
    }
    // Fallback to local file
    else if (translator.load("catyas_" + locale, "translations")) {
        translationLoaded = true;
    }
    // Try English as fallback
    else if (locale != "en" && translator.load(":/translations/catyas_en")) {
        translationLoaded = true;
    }

    if (translationLoaded) {
        app.installTranslator(&translator);
    }

    MainWindow window;
    window.show();

    return app.exec();
}