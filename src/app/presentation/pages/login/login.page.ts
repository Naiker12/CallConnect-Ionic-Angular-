import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/domain/use-cases/login.service';
import { ModalController } from '@ionic/angular';
import { VerificationModalComponent } from 'src/app/shared/components/verification-modal/verification-modal.component';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ValidationService } from 'src/app/core/validation/services/validation.service';
import { LoadingService } from 'src/app/core/services/loading.service'; // Importar el nuevo servicio
import { AuthError } from 'src/app/core/ exceptions/handlers/auth-error';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: false
})
export class LoginPage implements OnInit {
    form!: FormGroup;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService,
        private modalCtrl: ModalController,
        private toastService: CustomToastService,
        private navService: NavigationService,
        private validationService: ValidationService,
        private loadingService: LoadingService
    ) {
        this.initializeForm();
    }

    ngOnInit() {}

    private initializeForm(): void {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    async onLogin(): Promise<void> {
        try {
            this.validationService.validateLoginForm(this.form);
            
            await this.loadingService.show('Iniciando sesión...'); 

            const { email, password } = this.form.value;
            const isVerified = await this.loginService.login(email, password);
            
            await this.loadingService.hide();
            this.form.reset();

            if (!isVerified) {
                throw new AuthError('UNVERIFIED_EMAIL', 'Email no verificado');
            }

            this.navService.goToHome();
            
        } catch (error) {
            await this.loadingService.hide();             
            if (error instanceof AuthError && error.errorType === 'UNVERIFIED_EMAIL') {
                await this.presentVerificationModal();
            }
            this.toastService.handleError(error);
        }
    }

    private async presentVerificationModal(): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: VerificationModalComponent,
            componentProps: {
                title: 'Verificación requerida',
                message: 'Por favor verifica tu correo electrónico para continuar.'
            }
        });
        await modal.present();
    }

    goToRegister(): void {
        this.navService.goToRegister();
    }

    goToRecover(): void {
        this.navService.goToRecover();
    }
    
    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }
}