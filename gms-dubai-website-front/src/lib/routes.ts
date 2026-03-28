/**
 * Central route paths for the app. Use these for Link href and router.push.
 */
export const ROUTES = {
  home: '/',
  about: '/about',
  aboutGm: '/about/gm-message',
  aboutPrincipal: '/about/principal-message',
  achievements: '/about/achievements',
  academics: '/academics',
  academicsTab: (tab: string) => `/academics?tab=${tab}`,
  vrClassroom: '/vr-classroom',
  aiLab: '/ai-lab',
  askbook: '/askbook',
  admissions: '/admissions',
  fees: '/admissions/fees',
  enrolment: '/admissions/enrolment',
  uniforms: '/admissions/uniforms',
  transport: '/admissions/transport',
  syllabus: '/admissions/syllabus',
  policies: '/policies',
  circulars: '/circulars',
  newsletters: '/newsletters',
  gallery: '/gallery',
  news: '/news',
  newsDetail: (slug: string) => `/news/${slug}`,
  careers: '/careers',
  contact: '/contact',
} as const
