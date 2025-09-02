import { useState, useEffect, createContext, useContext } from 'react';

// Dictionaries for each language
const dictionaries = {
    en: {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        orders: 'Orders',
        settings: 'Settings',
        admin: 'Admin',
        logout: 'Logout',
        adminDashboard: 'Admin Dashboard',
        hello: 'Hello',
        totalProducts: 'Total Products',
        totalOrders: 'Total Orders',
        totalCategories: 'Total Categories',
        settingsTitle: 'Settings',
        languageLabel: 'Language',
        themeLabel: 'Theme',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        saveButton: 'Save Settings',
        savingStatus: 'Saving...',
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Failed to save settings.',
    },
    ar: {
        dashboard: 'لوحة التحكم',
        products: 'المنتجات',
        categories: 'الفئات',
        orders: 'الطلبات',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        adminDashboard: 'لوحة تحكم المدير',
        hello: 'مرحباً',
        totalProducts: 'إجمالي المنتجات',
        totalOrders: 'إجمالي الطلبات',
        totalCategories: 'إجمالي الفئات',
        settingsTitle: 'الإعدادات',
        languageLabel: 'اللغة',
        themeLabel: 'النمط',
        lightMode: 'الوضع الفاتح',
        darkMode: 'الوضع الداكن',
        saveButton: 'حفظ الإعدادات',
        savingStatus: 'جاري الحفظ...',
        saveSuccess: 'تم حفظ الإعدادات بنجاح!',
        saveError: 'فشل في حفظ الإعدادات.',
    }
};

const TranslationContext = createContext();

export function TranslationProvider({ children, initialLanguage }) {
    const [language, setLanguage] = useState(initialLanguage || 'en');
    const [t, setT] = useState(dictionaries[initialLanguage || 'en']);

    useEffect(() => {
        setT(dictionaries[language]);
        // Set document direction for RTL languages like Arabic
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }, [language]);

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    return useContext(TranslationContext);
}
