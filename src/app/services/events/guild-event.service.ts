import { Injectable } from '@angular/core';
import { Args } from 'src/app/types/ws-types';
import { ChannelService } from '../api/channel.service';
import { GuildService } from '../api/guild.service';
import { UserService } from '../api/user.service';

@Injectable({
  providedIn: 'root'
})
export class GuildEventService {
  constructor(
    private channelService: ChannelService,
    private guildService: GuildService,
    private userService: UserService,
  ) {}

  public createRole({ guildId, role }: Args.GuildRoleCreate) {
    const guild = this.guildService.getCached(guildId);
    guild.roles.push(role);
  }

  public deleteRole({ guildId, roleId }: Args.GuildRoleDelete) {
    const guild = this.guildService.getCached(guildId);
    const index = guild.roles.findIndex(r => r.id === roleId);

    guild.roles.splice(index, 1);
  }

  public updateRole({ guildId, roleId, partialRole }: Args.GuildRoleUpdate) {
    const guild = this.guildService.getCached(guildId);
    const index = guild.roles.findIndex(r => r.id === roleId);

    guild.roles[index] = Object.assign(guild.roles[index], partialRole);
  }

  public async addMember({ member }: Args.GuildMemberAdd) {
    const newUser = await this.userService.getAsync(member.userId);
    this.userService.add(newUser);

    const guild = this.guildService.getCached(member.guildId);
    guild.members.push(member);
  }

  public removeMember({ memberId, guildId }: Args.GuildMemberRemove) {
    const guild = this.guildService.getCached(guildId);
    const index = guild.members.findIndex(m => m.id === memberId);

    guild.members.splice(index, 1);
  }
  
  public updateMember({ guildId, partialMember, memberId }: Args.GuildMemberUpdate) {
    const guild = this.guildService.getCached(guildId);
    const oldMember = this.guildService.getMemberInGuild(guildId, memberId);
    const index = guild.members.findIndex(m => m.id === memberId);    

    return guild.members[index] = Object.assign(oldMember, partialMember);
  }

  public addChannel({ channel, guildId }: Args.ChannelCreate) {
    const guild = this.guildService.getCached(guildId);
    guild.channels.push(channel);
    this.channelService.add(channel);
  }
  public deleteChannel({ guildId, channelId }: Args.ChannelDelete) {
    const guild = this.guildService.getCached(guildId);
    const index = guild.channels.findIndex(c => c.id === channelId);

    guild.channels.splice(index, 1);
  }

  public updateGuild({ guildId, partialGuild }: Args.GuildUpdate) {
    this.guildService.upsert(guildId, partialGuild);
  }
  
  public deleteGuild({ guildId }: Args.GuildDelete | Args.GuildLeave) {
    while (this.guildService.getCached(guildId))
      this.guildService.delete(guildId);    
  }
}
