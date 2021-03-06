import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { AccordMock } from 'src/tests/accord-mock';
import { ChannelService } from '../api/channel.service';
import { MessageService } from '../api/message.service';
import { PingService } from '../ping.service';
import { UserService } from '../api/user.service';
import { ChannelEventService } from './channel-event.service';

describe('ChannelEventService', () => {
  let service: ChannelEventService;
  let userService: UserService;
  let messageService: MessageService;
  let channelService: ChannelService;
  let pingService: PingService;

  beforeEach(() => {
    TestBed
      .configureTestingModule({ imports: [AppModule] })
      .compileComponents();

    service = TestBed.inject(ChannelEventService);
    channelService = TestBed.inject(ChannelService);
    messageService = TestBed.inject(MessageService);
    userService = TestBed.inject(UserService);
    pingService = TestBed.inject(PingService);

    userService.self = AccordMock.self();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('add message, message added to cache', async () => {
    const message = await addMessage();
    const messages = messageService.getAllCached(message.channelId);
    
    expect(messages).toContain(message);
  });
  
  it('add message, not ignored, ping called', () => {  
    const spy = spyOn(pingService, 'add');
    addMessage();
    
    expect(spy).toHaveBeenCalled();
  });
  
  it('add message, ignored, ping not called', async () => {
    const spy = spyOn(pingService, 'add');
    const message = await addMessage();

    userService.self.ignored.channelIds.push(message.channelId);
    service.addMessage({ message });
    
    expect(spy).not.toHaveBeenCalled();
  });
  
  it('add message, updates last message id in channel', async () => {
    const message = await addMessage();
    
    const channel = channelService.getCached(message.channelId);
    expect(channel.lastMessageId).toEqual(message.id);
  });
  
  it('delete message, removed from cache', async () => {
    const message = await addMessage();
    
    const messages = messageService.getAllCached(message.channelId);
    expect(messages).not.toContain(message);
  });
  
  it('update message, updated in cache', async () => {
    const message = await addMessage();

    service.updateMessage({
      message: { ...message, content: 'hi' },
    });
    
    expect(message.content).toEqual('hi');
  });
  
  it('start typing, calls channel service to start typing', () => {
    const spy = spyOn(channelService, 'startTyping');

    service.startTyping({
      channelId: AccordMock.snowflake(),
      userId: AccordMock.snowflake(),
    });

    expect(spy).toHaveBeenCalled();
  });

  async function addMessage() {
    const channel = AccordMock.channel();
    const message = AccordMock.message({ channelId: channel.id });
    channelService.add(channel);

    await service.addMessage({ message });
    return message;
  }
});
