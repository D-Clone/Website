import { Component, OnInit } from '@angular/core';
import { UserService } from './services/api/user.service';
import { ThemeService } from './services/theme.service';
import { ActivatedRoute } from '@angular/router';
import { LogService } from './services/log.service';
import devtools from 'devtools-detect';
import { EventService } from './services/events/event.service';
import { ConfigService } from './services/config.service';
import { RedirectService } from './services/redirect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public config: ConfigService,
    private themeService: ThemeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private redirects: RedirectService,
    private log: LogService,
  ) {}

  public async ngOnInit() {
    await this.userService.init();

    this.config.init();
    this.redirects.init();
    this.themeService.init();
    
    this.handlePrompt();
    this.consoleWarning();
  }

  private handlePrompt() {
    this.route.queryParamMap.subscribe(async (map) => {
      const success = map.get('success');
      const error = map.get('error');
      if (success)
        await this.log.success(success);
      else if (error)
        await this.log.error(error);
    });
  }

  private consoleWarning() {
    const interval = setInterval(() => {
      if (!devtools.isOpen) return;

      this.log.consoleWarning();
      clearInterval(interval);
    }, 100);
  }
}
