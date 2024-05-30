import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppChibptComponent } from './app-chibpt.component';

const routes: Routes = [
    {
        path: '',
        component: AppChibptComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ChibptRoutingModule { }
