




import {Page} from './models/page.js';

const main = async () => {
   // Aguardar o DOM estar completamente carregado
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
         new Page();
      });
   } else {
      new Page();
   }
}

main();