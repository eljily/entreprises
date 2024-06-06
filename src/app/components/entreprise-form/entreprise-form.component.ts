import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EntrepriseService } from '../../services/entreprise.service';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-entreprise-form',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    DropdownModule,
    ChipsModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    MessagesModule,
  ],
  templateUrl: './entreprise-form.component.html',
  providers: [MessageService],
})
export class EntrepriseFormComponent implements OnInit {
  companyForm: FormGroup;
  displayDialog: boolean = false;
  isBrowser: boolean = false;
  data: any;

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private entrepriseService: EntrepriseService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.companyForm = this.fb.group({
        name: ['', Validators.required],
        city: ['', Validators.required],
        adresse: this.fb.group({
          location: ['', Validators.required],
          phoneNumber1: ['', Validators.required],
          website: ['', Validators.required],
          youtube: [''],
          linkedin: [''],
          github: [''],
          facebook: [''],
        }),
        shortDescription: ['', Validators.required],
        longDescription: ['', Validators.required],
        sectors: [[], Validators.required],
        technologiesUsed: [[], Validators.required],
        logo: ['', Validators.required],
      });
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      const formData = this.companyForm.value;

      // Construct socials array
      const socials = [
        { platform: 'Linkedin', value: formData.adresse.linkedin },
        { platform: 'Facebook', value: formData.adresse.facebook },
        { platform: 'WhatsApp', value: formData.adresse.whatsapp },
        { platform: 'Youtube', value: formData.adresse.youtube },
      ];

      // Construct result object
      const result = {
        name: formData.name,
        city: formData.city,
        adresse: {
          location: formData.adresse.location,
          phoneNumber1: formData.adresse.phoneNumber1,
          website: formData.adresse.website,
          socials: socials.filter((social) => social.value), // Remove empty values
        },
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        sectors: formData.sectors,
        technologiesUsed: formData.technologiesUsed,
        logo: formData.logo,
      };

      // Construct discordPayload object
      const discordPayload = {
        content: JSON.stringify(result, null, 2), // Send the result as formatted JSON string
      };

      console.log(discordPayload);
      this.data = JSON.stringify(discordPayload);
      this.entrepriseService.postDataToDiscord(this.data).subscribe(
        (response) => {
          console.log('Data posted to Discord successfully:', response);
          // Display success message
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Data posted to Discord successfully',
          });
        },
        (error) => {
          console.log(this.data);
          console.error('Error posting data to Discord:', error);
          // Display error message
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to post data to Discord',
          });
        }
      );
      this.displayDialog = false;
    } else {
      console.error('Form is invalid');
      // Display validation errors
      Object.keys(this.companyForm.controls).forEach((key) => {
        this.companyForm.controls[key].markAsDirty();
        this.companyForm.controls[key].updateValueAndValidity();
      });
    }
  }

  showDialog() {
    this.displayDialog = true;
  }
}