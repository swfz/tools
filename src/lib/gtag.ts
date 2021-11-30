type TimerEvent = {
  action: 'start' | 'reset' | 'pinp' | 'timeup';
  category: 'timer';
};

type TimelineEvent = {
  action: 'add_row' | 'change_unit';
  category: 'timeline';
};

export type Event = (TimerEvent | TimelineEvent) & {
  label?: Record<string, string | number | boolean> | string;
  value?: number | string;
};

export const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';
export const existsGaId = GA_ID !== '';

export const pageview = (path: string) => {
  window.gtag('config', GA_ID, {
    page_path: path,
  });
};

export const event = ({ action, category, label, value = '' }: Event) => {
  if (!existsGaId) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label ? JSON.stringify(label) : '',
    value,
  });
};
