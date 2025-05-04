import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ModalController, } from '@ionic/angular';
import { Contact } from 'src/app/core/models/contact';
import { ContactService } from 'src/app/core/services/contact.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddContactModalComponent } from 'src/app/shared/components/add-contact-modal/add-contact-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuService } from 'src/app/core/services/Menu.Service';
import { Router } from '@angular/router';




@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  isLoading = false;
  isContactMenuOpen = false;
  selectedContact: any
  scrolled = false;



  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private menuService: MenuService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts(): void {
    const userId = this.authService.getUserId?.();
    if (!userId) {
      return;
    }

    this.isLoading = true;
    this.contactService.getContacts(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }
  async openAddContactModal() {
    const modal = await this.modalCtrl.create({
      component: AddContactModalComponent
    });

    modal.onDidDismiss().then((result) => {
    });

    await modal.present();
  }

  async openMenu() {
    await this.menuService.openSideMenu();
  }

  openContactDetails(contact: any) {
    console.log('Mostrar detalles de:', contact);
  }


  openContactMenu(event: Event, contact: any) {
    event.stopPropagation();
    this.selectedContact = contact;
    this.isContactMenuOpen = true;
  }

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.scrolled = scrollTop > 50;
  }

  goToProfile(): void {
    if (this.router.url !== '/profile') {
      this.router.navigate(['/profile']);
    }
  }

}