import deAuth from './locales/de/auth.json';
import deBody from './locales/de/body.json';
import deBodyCheck from './locales/de/bodyCheck.json';
import deCommon from './locales/de/common.json';
import deExercises from './locales/de/exercises.json';
import deMuscles from './locales/de/muscles.json';
import deOnboarding from './locales/de/onboarding.json';
import dePaywall from './locales/de/paywall.json';
import dePlanCreate from './locales/de/planCreate.json';
import dePlanImport from './locales/de/planImport.json';
import deProfile from './locales/de/profile.json';
import deSupport from './locales/de/support.json';
import deToday from './locales/de/today.json';
import deTraining from './locales/de/training.json';
import deWorkout from './locales/de/workout.json';
import enAuth from './locales/en/auth.json';
import enBody from './locales/en/body.json';
import enBodyCheck from './locales/en/bodyCheck.json';
import enCommon from './locales/en/common.json';
import enExercises from './locales/en/exercises.json';
import enMuscles from './locales/en/muscles.json';
import enOnboarding from './locales/en/onboarding.json';
import enPaywall from './locales/en/paywall.json';
import enPlanCreate from './locales/en/planCreate.json';
import enPlanImport from './locales/en/planImport.json';
import enProfile from './locales/en/profile.json';
import enSupport from './locales/en/support.json';
import enToday from './locales/en/today.json';
import enTraining from './locales/en/training.json';
import enWorkout from './locales/en/workout.json';
import ptBRAuth from './locales/pt-BR/auth.json';
import ptBRBody from './locales/pt-BR/body.json';
import ptBRBodyCheck from './locales/pt-BR/bodyCheck.json';
import ptBRCommon from './locales/pt-BR/common.json';
import ptBRExercises from './locales/pt-BR/exercises.json';
import ptBRMuscles from './locales/pt-BR/muscles.json';
import ptBROnboarding from './locales/pt-BR/onboarding.json';
import ptBRPaywall from './locales/pt-BR/paywall.json';
import ptBRPlanCreate from './locales/pt-BR/planCreate.json';
import ptBRPlanImport from './locales/pt-BR/planImport.json';
import ptBRProfile from './locales/pt-BR/profile.json';
import ptBRSupport from './locales/pt-BR/support.json';
import ptBRToday from './locales/pt-BR/today.json';
import ptBRTraining from './locales/pt-BR/training.json';
import ptBRWorkout from './locales/pt-BR/workout.json';
import ptPTAuth from './locales/pt-PT/auth.json';
import ptPTBody from './locales/pt-PT/body.json';
import ptPTBodyCheck from './locales/pt-PT/bodyCheck.json';
import ptPTCommon from './locales/pt-PT/common.json';
import ptPTExercises from './locales/pt-PT/exercises.json';
import ptPTMuscles from './locales/pt-PT/muscles.json';
import ptPTOnboarding from './locales/pt-PT/onboarding.json';
import ptPTPaywall from './locales/pt-PT/paywall.json';
import ptPTPlanCreate from './locales/pt-PT/planCreate.json';
import ptPTPlanImport from './locales/pt-PT/planImport.json';
import ptPTProfile from './locales/pt-PT/profile.json';
import ptPTSupport from './locales/pt-PT/support.json';
import ptPTToday from './locales/pt-PT/today.json';
import ptPTTraining from './locales/pt-PT/training.json';
import ptPTWorkout from './locales/pt-PT/workout.json';

// English is the source language; other locales mirror its keys.
export const resources = {
  en: {
    common: enCommon,
    paywall: enPaywall,
    support: enSupport,
    bodyCheck: enBodyCheck,
    planCreate: enPlanCreate,
    planImport: enPlanImport,
    auth: enAuth,
    onboarding: enOnboarding,
    today: enToday,
    training: enTraining,
    workout: enWorkout,
    muscles: enMuscles,
    body: enBody,
    profile: enProfile,
    exercises: enExercises,
  },
  de: {
    common: deCommon,
    paywall: dePaywall,
    support: deSupport,
    bodyCheck: deBodyCheck,
    planCreate: dePlanCreate,
    planImport: dePlanImport,
    auth: deAuth,
    onboarding: deOnboarding,
    today: deToday,
    training: deTraining,
    workout: deWorkout,
    muscles: deMuscles,
    body: deBody,
    profile: deProfile,
    exercises: deExercises,
  },
  'pt-PT': {
    common: ptPTCommon,
    paywall: ptPTPaywall,
    support: ptPTSupport,
    bodyCheck: ptPTBodyCheck,
    planCreate: ptPTPlanCreate,
    planImport: ptPTPlanImport,
    auth: ptPTAuth,
    onboarding: ptPTOnboarding,
    today: ptPTToday,
    training: ptPTTraining,
    workout: ptPTWorkout,
    muscles: ptPTMuscles,
    body: ptPTBody,
    profile: ptPTProfile,
    exercises: ptPTExercises,
  },
  'pt-BR': {
    common: ptBRCommon,
    paywall: ptBRPaywall,
    support: ptBRSupport,
    bodyCheck: ptBRBodyCheck,
    planCreate: ptBRPlanCreate,
    planImport: ptBRPlanImport,
    auth: ptBRAuth,
    onboarding: ptBROnboarding,
    today: ptBRToday,
    training: ptBRTraining,
    workout: ptBRWorkout,
    muscles: ptBRMuscles,
    body: ptBRBody,
    profile: ptBRProfile,
    exercises: ptBRExercises,
  },
} as const;

export type AppLanguage = keyof typeof resources;
export const APP_LANGUAGES = Object.keys(resources) as AppLanguage[];
