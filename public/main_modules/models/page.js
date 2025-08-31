
import { HomePage } from "../templates/HomePage.js";

export class Page {

   mainContent = "app"
   templates = [HomePage, HomePage, HomePage, HomePage, HomePage, HomePage];
   navButtons = [];

   constructor() {
      this.initializeButtons();
      this.setupEventListeners();
      // Carregar o conteúdo inicial (Home)
      this.setMainContent(0);
   }

   initializeButtons() {
      this.navButtons = [
         document.getElementById('btnHome'),
         document.getElementById('btnProject'),
         document.getElementById('btnPodcasts'),
         document.getElementById('btnPAAM'),
         document.getElementById('btnContact'),
         document.getElementById('btnCommunity')
      ];
   }

   setupEventListeners() {
      this.navButtons.forEach((button, index) => {
         if (button) {
            button.addEventListener('click', (e) => {
               e.preventDefault();
               this.setMainContent(index);
            });
         }
      });
   }

   setMainContent(index = 0) {
      const app = document.getElementById("app");
      if (app && this.templates[index]) {
         app.innerHTML = this.templates[index]();
      }
   }

}
