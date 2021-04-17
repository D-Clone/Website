import { Component, Input, OnInit } from '@angular/core';
import { LogService } from 'src/app/services/log.service';
import { RTCService } from 'src/app/services/rtc.service';
import { UsersService } from 'src/app/services/users.service';
import { WSService } from 'src/app/services/ws.service';
import { ChannelTypes, Lean } from 'src/app/types/entity-types';

@Component({
  selector: 'voice-channel',
  templateUrl: './voice-channel.component.html',
  styleUrls: ['./voice-channel.component.css']
})
export class VoiceChannelComponent implements OnInit {
  @Input() channel: ChannelTypes.Voice;
  @Input() guild: Lean.Guild;

  constructor(
    private rtc: RTCService,
    private userService: UsersService,
    private ws: WSService) {}

  async ngOnInit() {
    await this.rtc.init();
    await this.userService.init();

    this.hookWSEvents();
  }

  async hookWSEvents() {
    this.ws.on('VOICE_STATE_UPDATE', async ({ userId, voice, memberIds }) => {
      if (this.channel._id !== voice.channelId) return;

      const user = this.userService.user;
      if (user._id === userId)
        user.voice = voice;
      
      this.channel.memberIds = memberIds;
    }, this)
    .on('PRESENCE_UPDATE', ({ userId }) => {
      this.rtc.audio.stop(userId);
    }, this);
  }
  
  async join() {
    const user = this.userService.user;
    const isSelfConnected = this.channel.memberIds.includes(user._id);    
    if (isSelfConnected) return;

    user.voice = {
      ...user.voice,
      channelId: this.channel._id,
      guildId: this.guild._id,
    };

    this.ws.emit('VOICE_STATE_UPDATE', { voice: user.voice }, this);
  }

  getUser(userId: string) {
    return this.userService.getKnown(userId);
  }
}
