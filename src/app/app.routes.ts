import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CoursePageComponent } from './course-page/course-page.component';


export const routes: Routes = [
    {path: 'course-page/:id', component: CoursePageComponent}
];

export default routes;
