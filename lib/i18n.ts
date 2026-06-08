"use client"

import { useSyncExternalStore } from "react"

export const locales = ["en-US", "pt-BR"] as const

export type Locale = (typeof locales)[number]

type Messages = Record<string, string>

const STORAGE_KEY = "spendwise-locale"
const DEFAULT_LOCALE: Locale = "en-US"

const messages: Record<Locale, Messages> = {
  "en-US": {
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transactions",
    "nav.categories": "Categories",
    "nav.profile": "Profile",
    "common.back": "Back",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.search": "Search",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.cancel": "Cancel",
    "common.category": "Category",
    "common.type": "Type",
    "common.date": "Date",
    "common.amount": "Amount",
    "common.expense": "Expense",
    "common.income": "Income",
    "common.expenses": "Expenses",
    "common.id": "ID",
    "category.food": "Food",
    "category.transport": "Transport",
    "category.housing": "Housing",
    "category.leisure": "Leisure",
    "category.health": "Health",
    "category.education": "Education",
    "category.salary": "Salary",
    "category.freelance": "Freelance",
    "category.investments": "Investments",
    "dashboard.totalBalance": "Total Balance",
    "dashboard.currentMonthNet": "current month net",
    "dashboard.newTransaction": "New\nTransaction",
    "dashboard.viewAnalytics": "View\nAnalytics",
    "dashboard.monthlyIncome": "Monthly Income",
    "dashboard.monthlyExpenses": "Monthly Expenses",
    "dashboard.monthlySnapshot": "Monthly Snapshot",
    "dashboard.loadingInsight": "Loading your monthly insight...",
    "dashboard.noDataYet": "No data yet",
    "dashboard.addFirstMonthly":
      "Add your first income or expense to see your monthly balance.",
    "dashboard.positiveMonth": "You are positive this month.",
    "dashboard.expensesHigher":
      "Expenses are higher than income this month.",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.viewAll": "View All",
    "dashboard.loadingActivity": "Loading activity...",
    "dashboard.noTransactions": "No transactions yet.",
    "dashboard.savingsGoal": "Savings Goal",
    "dashboard.savingsGoalName": "New Tesla Model S",
    "dashboard.savingsGoalProgress": "65% Completed",
    "transactions.title": "Transactions across your accounts.",
    "transactions.history": "History",
    "transactions.weekly": "Weekly",
    "transactions.monthly": "Monthly",
    "transactions.yearly": "Yearly",
    "transactions.allTime": "All Time",
    "transactions.allTypes": "All Types",
    "transactions.searchPlaceholder": "Search description",
    "transactions.allCategories": "All Categories",
    "transactions.loadingTransactions": "Loading transactions...",
    "transactions.noTransactions": "No transactions found.",
    "transactions.loadingCategories": "Loading categories...",
    "transactions.page": "Page",
    "transactions.details": "Transaction details",
    "transactions.transaction": "TRANSACTION",
    "newTransaction.title": "New Transaction",
    "newTransaction.short": "New",
    "newTransaction.help": "Help",
    "newTransaction.description": "Description",
    "newTransaction.descriptionPlaceholder": "What was this for?",
    "newTransaction.category": "Category",
    "newTransaction.selectCategory": "Select a category",
    "newTransaction.loadingCategories": "Loading categories...",
    "newTransaction.categoryHint": "Choose where this transaction belongs",
    "newTransaction.categoryType": "{type} category",
    "newTransaction.noCategories": "No categories available for this type.",
    "newTransaction.dateOptional": "Date (Optional)",
    "newTransaction.pickDate": "Pick a date",
    "newTransaction.register": "Register Transaction",
    "newTransaction.registering": "Registering...",
    "newTransaction.amountRequired": "Amount is required.",
    "newTransaction.amountInvalid":
      "Enter a valid amount using numbers and one decimal separator.",
    "newTransaction.amountPositive": "Amount must be greater than zero.",
    "newTransaction.amountMax": "Amount cannot exceed 10,000,000.",
    "newTransaction.descriptionRequired": "Description is required.",
    "newTransaction.categoryRequired": "Category is required.",
    "newTransaction.loadCategoriesError": "Unable to load categories.",
    "newTransaction.submitError": "Unable to register transaction.",
    "newTransaction.helpTitle": "How transactions work",
    "newTransaction.helpAmount":
      "Use the absolute value. Separators follow the selected currency, and SpendWise applies the sign based on income or expense.",
    "newTransaction.helpType":
      "Expense reduces your balance. Income increases it.",
    "newTransaction.helpCategory":
      "Categories organize your history and dashboard insights.",
    "newTransaction.helpDate": "Optional. If empty, today's date will be used.",
    "categories.title": "Categories",
    "categories.subtitle":
      "Organize your transactions with income and expense categories.",
    "categories.add": "Add Category",
    "categories.loading": "Loading categories...",
    "categories.empty": "No categories found.",
    "categories.newTitle": "New category",
    "categories.newSubtitle": "Create a category for income or expenses.",
    "categories.name": "Name",
    "categories.namePlaceholder": "Category name",
    "categories.create": "Create Category",
    "categories.creating": "Creating...",
    "categories.defaultTitle": "Default Categories",
    "categories.customTitle": "Custom Categories",
    "categories.defaultHint": "Available to every SpendWise account",
    "categories.customHint": "Created and managed by you",
    "categories.edit": "Edit",
    "categories.delete": "Delete",
    "categories.editTitle": "Edit category",
    "categories.editSubtitle": "Update the category name or transaction type.",
    "categories.update": "Update Category",
    "categories.updating": "Updating...",
    "categories.deleteTitle": "Delete category?",
    "categories.deleteDescription":
      "This action cannot be undone. Categories with linked transactions cannot be deleted.",
    "categories.deleting": "Deleting...",
    "categories.noDefault": "No default categories found.",
    "categories.noCustom": "You have not created any custom categories yet.",
    "profile.title": "Profile",
    "profile.loading": "Loading profile...",
    "profile.accountDetails": "Your account details",
    "profile.member": "Member",
    "profile.account": "Account",
    "profile.personalInformation": "Personal Information",
    "profile.nameUnavailable": "Name unavailable",
    "profile.email": "Email",
    "profile.emailUnavailable": "Email unavailable",
    "profile.preferences": "Preferences",
    "profile.appearance": "Appearance",
    "profile.appearanceHint": "Toggle light or dark mode",
    "profile.language": "Language",
    "profile.languageHint": "Choose your preferred language",
    "profile.currency": "Currency",
    "profile.currencyHint": "Choose how monetary values are displayed",
    "profile.security": "Security",
    "profile.authenticatedSession": "Authenticated Session",
    "profile.sessionHint": "Protected by your SpendWise token",
    "profile.active": "Active",
    "profile.memberSince": "Member Since",
    "profile.unavailable": "Unavailable",
    "profile.logout": "Logout from SpendWise",
    "theme.light": "Switch to light mode",
    "theme.dark": "Switch to dark mode",
    "language.english": "English",
    "language.portugueseBrazil": "Portuguese (Brazil)",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.emailPlaceholder": "Enter your email",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.namePlaceholder": "Enter your full name",
    "auth.nameRequired": "Name is required.",
    "auth.nameMin": "Name must have at least 2 characters.",
    "auth.emailRequired": "Email is required.",
    "auth.emailInvalid": "Enter a valid email address.",
    "auth.emailAlreadyRegistered": "This email is already registered.",
    "auth.passwordRequired": "Password is required.",
    "auth.passwordLength": "Password must be between 8 and 72 characters.",
    "auth.passwordPattern":
      "Password must include at least one letter and one number. Special characters are allowed.",
    "auth.passwordHint":
      "Use 8 to 72 characters with at least one letter and one number. Special characters are allowed.",
    "auth.createAccountFailed": "Unable to create your account. Check the fields and try again.",
    "auth.invalidCredentials": "Invalid email or password.",
    "auth.unexpectedError": "An unexpected error occurred. Try again.",
    "auth.signIn": "Sign in",
    "auth.signingIn": "Signing in...",
    "auth.signUp": "Sign up",
    "auth.signingUp": "Creating account...",
    "auth.createAccount": "Create your account",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
  },
  "pt-BR": {
    "nav.dashboard": "Início",
    "nav.transactions": "Transações",
    "nav.categories": "Categorias",
    "nav.profile": "Perfil",
    "common.back": "Voltar",
    "common.close": "Fechar",
    "common.loading": "Carregando...",
    "common.search": "Buscar",
    "common.previous": "Anterior",
    "common.next": "Próxima",
    "common.cancel": "Cancelar",
    "common.category": "Categoria",
    "common.type": "Tipo",
    "common.date": "Data",
    "common.amount": "Valor",
    "common.expense": "Despesa",
    "common.income": "Ganhos",
    "common.expenses": "Despesas",
    "common.id": "ID",
    "category.food": "Alimentação",
    "category.transport": "Transporte",
    "category.housing": "Moradia",
    "category.leisure": "Lazer",
    "category.health": "Saúde",
    "category.education": "Educação",
    "category.salary": "Salário",
    "category.freelance": "Trabalho autônomo",
    "category.investments": "Investimentos",
    "dashboard.totalBalance": "Saldo Total",
    "dashboard.currentMonthNet": "saldo líquido do mês",
    "dashboard.newTransaction": "Nova\nTransação",
    "dashboard.viewAnalytics": "Ver\nAnálises",
    "dashboard.monthlyIncome": "Ganhos do Mês",
    "dashboard.monthlyExpenses": "Despesas do Mês",
    "dashboard.monthlySnapshot": "Resumo Mensal",
    "dashboard.loadingInsight": "Carregando seu insight mensal...",
    "dashboard.noDataYet": "Sem dados ainda",
    "dashboard.addFirstMonthly":
      "Adicione seu primeiro ganho ou despesa para ver o saldo mensal.",
    "dashboard.positiveMonth": "Seu mês está positivo.",
    "dashboard.expensesHigher":
      "As despesas estão maiores que os ganhos neste mês.",
    "dashboard.recentActivity": "Atividade Recente",
    "dashboard.viewAll": "Ver Tudo",
    "dashboard.loadingActivity": "Carregando atividade...",
    "dashboard.noTransactions": "Nenhuma transação ainda.",
    "dashboard.savingsGoal": "Meta de Economia",
    "dashboard.savingsGoalName": "Novo Tesla Model S",
    "dashboard.savingsGoalProgress": "65% Concluído",
    "transactions.title": "Transações das suas contas.",
    "transactions.history": "Histórico",
    "transactions.weekly": "Semanal",
    "transactions.monthly": "Mensal",
    "transactions.yearly": "Anual",
    "transactions.allTime": "Todo Período",
    "transactions.allTypes": "Todos os Tipos",
    "transactions.searchPlaceholder": "Buscar descrição",
    "transactions.allCategories": "Todas as Categorias",
    "transactions.loadingTransactions": "Carregando transações...",
    "transactions.noTransactions": "Nenhuma transação encontrada.",
    "transactions.loadingCategories": "Carregando categorias...",
    "transactions.page": "Página",
    "transactions.details": "Detalhes da transação",
    "transactions.transaction": "TRANSAÇÃO",
    "newTransaction.title": "Nova Transação",
    "newTransaction.short": "Nova",
    "newTransaction.help": "Ajuda",
    "newTransaction.description": "Descrição",
    "newTransaction.descriptionPlaceholder": "Do que foi essa transação?",
    "newTransaction.category": "Categoria",
    "newTransaction.selectCategory": "Selecione uma categoria",
    "newTransaction.loadingCategories": "Carregando categorias...",
    "newTransaction.categoryHint": "Escolha onde essa transação se encaixa",
    "newTransaction.categoryType": "Categoria de {type}",
    "newTransaction.noCategories": "Nenhuma categoria disponível para este tipo.",
    "newTransaction.dateOptional": "Data (Opcional)",
    "newTransaction.pickDate": "Escolher uma data",
    "newTransaction.register": "Registrar Transação",
    "newTransaction.registering": "Registrando...",
    "newTransaction.amountRequired": "O valor é obrigatório.",
    "newTransaction.amountInvalid":
      "Insira um valor válido usando números e um separador decimal.",
    "newTransaction.amountPositive": "O valor deve ser maior que zero.",
    "newTransaction.amountMax": "O valor não pode ultrapassar 10.000.000.",
    "newTransaction.descriptionRequired": "A descrição é obrigatória.",
    "newTransaction.categoryRequired": "A categoria é obrigatória.",
    "newTransaction.loadCategoriesError": "Não foi possível carregar as categorias.",
    "newTransaction.submitError": "Não foi possível registrar a transação.",
    "newTransaction.helpTitle": "Como as transações funcionam",
    "newTransaction.helpAmount":
      "Use o valor absoluto. Os separadores seguem a moeda selecionada, e o SpendWise aplica o sinal conforme ganho ou despesa.",
    "newTransaction.helpType":
      "Despesa reduz seu saldo. Ganho aumenta seu saldo.",
    "newTransaction.helpCategory":
      "Categorias organizam seu histórico e os insights do dashboard.",
    "newTransaction.helpDate": "Opcional. Se ficar vazio, a data de hoje será usada.",
    "categories.title": "Categorias",
    "categories.subtitle":
      "Organize suas transações com categorias de ganhos e despesas.",
    "categories.add": "Adicionar Categoria",
    "categories.loading": "Carregando categorias...",
    "categories.empty": "Nenhuma categoria encontrada.",
    "categories.newTitle": "Nova categoria",
    "categories.newSubtitle": "Crie uma categoria para ganhos ou despesas.",
    "categories.name": "Nome",
    "categories.namePlaceholder": "Nome da categoria",
    "categories.create": "Criar Categoria",
    "categories.creating": "Criando...",
    "categories.defaultTitle": "Categorias Padrão",
    "categories.customTitle": "Categorias Personalizadas",
    "categories.defaultHint": "Disponíveis para todas as contas SpendWise",
    "categories.customHint": "Criadas e gerenciadas por você",
    "categories.edit": "Editar",
    "categories.delete": "Excluir",
    "categories.editTitle": "Editar categoria",
    "categories.editSubtitle": "Atualize o nome ou o tipo da transação.",
    "categories.update": "Atualizar Categoria",
    "categories.updating": "Atualizando...",
    "categories.deleteTitle": "Excluir categoria?",
    "categories.deleteDescription":
      "Esta ação não pode ser desfeita. Categorias com transações vinculadas não podem ser excluídas.",
    "categories.deleting": "Excluindo...",
    "categories.noDefault": "Nenhuma categoria padrão encontrada.",
    "categories.noCustom": "Você ainda não criou categorias personalizadas.",
    "profile.title": "Perfil",
    "profile.loading": "Carregando perfil...",
    "profile.accountDetails": "Detalhes da sua conta",
    "profile.member": "Membro",
    "profile.account": "Conta",
    "profile.personalInformation": "Informações Pessoais",
    "profile.nameUnavailable": "Nome indisponível",
    "profile.email": "Email",
    "profile.emailUnavailable": "Email indisponível",
    "profile.preferences": "Preferências",
    "profile.appearance": "Aparência",
    "profile.appearanceHint": "Alternar entre modo claro e escuro",
    "profile.language": "Idioma",
    "profile.languageHint": "Escolha seu idioma preferido",
    "profile.currency": "Moeda",
    "profile.currencyHint": "Escolha como os valores monetários são exibidos",
    "profile.security": "Segurança",
    "profile.authenticatedSession": "Sessão Autenticada",
    "profile.sessionHint": "Protegida pelo seu token SpendWise",
    "profile.active": "Ativa",
    "profile.memberSince": "Membro Desde",
    "profile.unavailable": "Indisponível",
    "profile.logout": "Sair do SpendWise",
    "theme.light": "Alternar para modo claro",
    "theme.dark": "Alternar para modo escuro",
    "language.english": "Inglês",
    "language.portugueseBrazil": "Português (Brasil)",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.name": "Nome",
    "auth.emailPlaceholder": "Digite seu email",
    "auth.passwordPlaceholder": "Digite sua senha",
    "auth.namePlaceholder": "Digite seu nome completo",
    "auth.nameRequired": "O nome é obrigatório.",
    "auth.nameMin": "O nome deve ter pelo menos 2 caracteres.",
    "auth.emailRequired": "O email é obrigatório.",
    "auth.emailInvalid": "Digite um email válido.",
    "auth.emailAlreadyRegistered": "Este email já está cadastrado.",
    "auth.passwordRequired": "A senha é obrigatória.",
    "auth.passwordLength": "A senha deve ter entre 8 e 72 caracteres.",
    "auth.passwordPattern":
      "A senha deve ter pelo menos uma letra e um número. Caracteres especiais são permitidos.",
    "auth.passwordHint":
      "Use de 8 a 72 caracteres com pelo menos uma letra e um número. Caracteres especiais são permitidos.",
    "auth.createAccountFailed": "Não foi possível criar sua conta. Confira os campos e tente novamente.",
    "auth.invalidCredentials": "Email ou senha inválidos.",
    "auth.unexpectedError": "Ocorreu um erro inesperado. Tente novamente.",
    "auth.signIn": "Entrar",
    "auth.signingIn": "Entrando...",
    "auth.signUp": "Cadastrar",
    "auth.signingUp": "Criando conta...",
    "auth.createAccount": "Crie sua conta",
    "auth.noAccount": "Ainda não tem uma conta?",
    "auth.hasAccount": "Já tem uma conta?",
  },
}

let currentLocale: Locale = DEFAULT_LOCALE
const listeners = new Set<() => void>()

const isLocale = (value: string | null): value is Locale =>
  value === "en-US" || value === "pt-BR"

const getBrowserLocale = (): Locale => {
  const browserLanguages = navigator.languages.length
    ? navigator.languages
    : [navigator.language]

  return browserLanguages.some((language) =>
    language.toLowerCase().startsWith("pt")
  )
    ? "pt-BR"
    : "en-US"
}

const getStoredLocale = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : getBrowserLocale()
}

const emit = () => {
  listeners.forEach((listener) => listener())
}

export function setLocale(locale: Locale) {
  currentLocale = locale

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }

  emit()
}

export function getLocaleSnapshot() {
  currentLocale = getStoredLocale()
  return currentLocale
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function interpolate(template: string, values?: Record<string, string>) {
  if (!values) {
    return template
  }

  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )
}

export function useI18n() {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => DEFAULT_LOCALE
  )

  const t = (key: string, values?: Record<string, string>) => {
    const dictionary = messages[locale] ?? messages[DEFAULT_LOCALE]
    const fallback = messages[DEFAULT_LOCALE][key] ?? key
    return interpolate(dictionary[key] ?? fallback, values)
  }

  return {
    locale,
    setLocale,
    t,
  }
}
