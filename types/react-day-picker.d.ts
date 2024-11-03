import 'react-day-picker';

declare module 'react-day-picker' {
  export interface DayPickerCustomComponents {
    IconLeft?: React.ComponentType<{ props?: unknown }>;
    IconRight?: React.ComponentType<{ props?: unknown }>;
  }
}