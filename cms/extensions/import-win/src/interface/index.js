import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './index.vue';

export default defineInterface({
  id: 'win-importer',
  name: 'Import Win',
  icon: 'file_download',
  description: 'Paste an article URL to auto-populate win fields via OpenAI.',
  component: InterfaceComponent,
  types: ['alias'],
  localTypes: ['presentation'],
  group: 'presentation',
  options: null,
  hideLabel: false,
  hideLoader: true,
});
