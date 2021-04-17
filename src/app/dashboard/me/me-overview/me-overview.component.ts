import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LogService } from 'src/app/services/log.service';
import { WSService } from 'src/app/services/ws.service';
import { patterns } from 'src/app/types/entity-types';
import { UsersService } from '../../../services/users.service';
import { TabType } from '../friends-list/friends-list.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './me-overview.component.html',
  styleUrls: ['./me-overview.component.css']
})
export class DashboardOverviewComponent {
  addFriendForm = new FormGroup({
    username: new FormControl('', [      
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(32),
      Validators.pattern(patterns.username),
    ])
  });
  
  friendPromptOpen = false;
  tab: TabType = 'ONLINE'; 

  get user() { return this.userService.user; }

  constructor(
    private log: LogService,
    private userService: UsersService,
    private ws: WSService) {
    document.title = 'Accord - Dashboard';

    this.setTab('ONLINE');
  }

  sendFriendRequest() {
    if (this.addFriendForm.invalid) return;

    this.ws.emit('SEND_FRIEND_REQUEST', {
      friendUsername: this.addFriendForm.value.username
    }, this);
  }

  setTab(tab: TabType) {
    this.friendPromptOpen = false;
    this.tab = tab;
  }
}