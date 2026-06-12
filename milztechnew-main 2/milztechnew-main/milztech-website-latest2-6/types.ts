
export type Language = 'ja' | 'en';

export interface Dictionary {
  nav_about: string;
  nav_service: string;
  nav_contact: string;
  service_title: string;
  items: string;
  vision_body: string;
  core_title: string;
  core_body: string;
  svc_ai_desc: string;
  // AI Projects
  svc_ai_project_estate: string;
  svc_ai_detail_estate: string;
  svc_ai_project_openframe: string;
  svc_ai_detail_openframe: string;
  // Production
  svc_pv_desc: string;
  svc_pv_project: string;
  svc_pv_detail: string;
  svc_travel: string;
  project_example_label: string;
  contact_title: string;
  contact_body: string;
  contact_cta: string;
  founders_label: string;
  founder_wada_role: string;
  founder_takano_role: string;
  founders_message: string;
  form_name: string;
  form_email: string;
  form_message: string;
  form_send: string;
  form_sending: string;
  form_success: string;
  form_ai_reply_label: string;
  // Company Outline
  company_title: string;
  co_name_label: string;
  co_name_value: string;
  co_est_label: string;
  co_est_value: string;
  co_address_label: string;
  co_address_value: string;
  co_business_label: string;
  co_business_value: string;
}

export type Dictionaries = Record<Language, Dictionary>;
