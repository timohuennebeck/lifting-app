-- Legal texts can be published in Korean, the app's fifth language.
alter table public.legal_documents drop constraint legal_documents_locale_check;

alter table public.legal_documents
  add constraint legal_documents_locale_check
  check (locale in ('en', 'de', 'pt-PT', 'pt-BR', 'ko'));
