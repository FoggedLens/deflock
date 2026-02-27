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
  options: null,
  hideLabel: true,
  hideLoader: true,
});
