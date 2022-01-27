export interface ChatMsgChild {
  message: string;
  stampStr: string;
  file?: string;
  mimetype?: string;
  file_name?: string;
}

export interface ChatMsg {
  nickname: string;
  avatar: string;
  messages: ChatMsgChild[];
  stamp: string;
  type: 'shippers' | 'carriers';
  status?: 'received';
}
