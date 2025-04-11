#!/bin/bash

# Fix the TranslationWrapper import in all pages
find src/app -name "*.tsx" -exec sed -i '' 's|@/components/TranslationWrapper|../../components/TranslationWrapper|g' {} \;

# Fix import statements in app subfolders
find src/app -mindepth 1 -type d -exec find {} -name "*.tsx" -exec sed -i '' 's|import { useLanguage } from "@/context/LanguageContext"|import { useLanguage } from "../../context/LanguageContext"|g' {} \; \;

# Fix the t function usage
find src/app -name "*.tsx" -exec sed -i '' 's|const { t } = useLanguage()|const { language } = useLanguage();\n  const { t } = useTranslation()|g' {} \;

# Add the react-i18next import
find src/app -name "*.tsx" -exec grep -l "useLanguage" {} \; | xargs -I{} sed -i '' '/useLanguage/a\
import { useTranslation } from "react-i18next";' {}

echo "Fixed all pages with translation issues!" 