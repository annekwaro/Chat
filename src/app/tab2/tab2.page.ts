import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { appsOutline, options } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { IonicSlides } from '@ionic/angular';
import {
  IonCard,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonThumbnail,
  IonText,
  IonList,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

register();

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonCard,
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonIcon,
    IonThumbnail,
    IonText,
    IonList,
    CommonModule,
  ],
})
export class Tab2Page implements OnInit {
  swiperModules = [IonicSlides];
  images: any[] = [];

  constructor() {
    addIcons({ appsOutline, options });
  }

  ngOnInit() {
    this.images = [
      {
        src: 'assets/imgs/image9.png',
        alt: 'Image 1',
        title: 'Title 1',
        description: 'Description 1',
        backgroundColor: '#0558e7',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#55d6c2',
      },
      {
        src: 'assets/imgs/image10.png',
        alt: 'Image 10',
        title: 'Title 10',
        description: 'Description 10',
        backgroundColor: '#e27396',
      },
      {
        src: 'assets/imgs/image4.png',
        alt: 'Image 4',
        title: 'Title 4',
        description: 'Description 4',
        backgroundColor: '#6e78ff',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#f68c70',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#ffc409',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: ' #c1d3fe',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#adf7b6',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#ffb3c6',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#ff686b',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#ffcccc',
      },
      {
        src: 'assets/imgs/image11.png',
        alt: 'Image 2',
        title: 'Title 2',
        description: 'Description 2',
        backgroundColor: '#ffcccc',
      },

      // Add more images here
    ];
  }

  onSwiper(swiper) {
    console.log(swiper);
  }

  onSlideChange() {
    console.log('slide change');
    console.log(this.images);
  }

  loadMoreImages(event) {
    // Simulate loading more images after a short delay
    setTimeout(() => {
      // Load more images or append additional images to the existing array
      this.images = this.images.concat(this.images.slice(0, 3));

      // Complete the infinite scroll event
      event.target.complete();

      // Optionally, disable the infinite scroll if reaching a certain condition, e.g., no more images to load
      if (this.images.length >= 30) {
        event.target.disabled = true;
      }
    }, 1000); // Simulated delay
  }
}
