import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagsComponent } from './tags.component';
import { TagsFormComponent } from './components/tags-form/tags-form.component';

const routes: Routes = [
  {
    path: '',
    component: TagsComponent
  },
  {
    path: 'create',
    component: TagsFormComponent
  },
  {
    path: 'edit/:tag_id',
    component: TagsFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagsRoutingModule {}
