




const { Message, Conversation, User, Property } = require('../models');





exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content, propertyId } = req.body;

    
    let conversation = await Conversation.findOne({
      $or: [
        { user1_id: senderId, user2_id: receiverId },
        { user1_id: receiverId, user2_id: senderId }
      ]
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user1_id: senderId,
        user2_id: receiverId,
        property_id: propertyId || null
      });
    }

    
    const message = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      receiver_id: receiverId,
      content
    });

    
    await Conversation.findByIdAndUpdate(conversation._id, {
      last_message_at: new Date()
    });

    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender_id', 'display_name profile_image_url')
      .lean();

    res.status(201).json({
      success: true,
      message: {
        ...populatedMessage,
        id: populatedMessage._id
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};





exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      $or: [{ user1_id: userId }, { user2_id: userId }]
    })
      .populate('user1_id', 'display_name profile_image_url')
      .populate('user2_id', 'display_name profile_image_url')
      .populate('property_id', 'title images')
      .sort({ last_message_at: -1 })
      .lean();

    
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversation_id: conv._id })
          .sort({ created_at: -1 })
          .lean();

        const otherUser = conv.user1_id._id.toString() === userId ? conv.user2_id : conv.user1_id;

        
        const unreadCount = await Message.countDocuments({
          conversation_id: conv._id,
          receiver_id: userId,
          is_read: false
        });

        return {
          id: conv._id,
          other_user_id: otherUser._id,
          other_user_name: otherUser.display_name,
          other_user_image: otherUser.profile_image_url,
          property_id: conv.property_id ? conv.property_id._id : null,
          property_title: conv.property_id ? conv.property_id.title : null,
          last_message: lastMessage ? lastMessage.content : null,
          unread_count: unreadCount,
          last_message_at: conv.last_message_at
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithMessages
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};





exports.getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    
    const conversation = await Conversation.findOne({
      $or: [
        { user1_id: currentUserId, user2_id: otherUserId },
        { user1_id: otherUserId, user2_id: currentUserId }
      ]
    }).populate('property_id', 'title images');

    if (!conversation) {
      return res.json({
        success: true,
        messages: [],
        property: null
      });
    }

    
    const messages = await Message.find({ conversation_id: conversation._id })
      .populate('sender_id', 'display_name profile_image_url')
      .sort({ created_at: 1 })
      .lean();

    
    await Message.updateMany(
      {
        conversation_id: conversation._id,
        receiver_id: currentUserId,
        is_read: false
      },
      { is_read: true }
    );

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      message: msg.content,
      sender_id: msg.sender_id._id,
      sender_name: msg.sender_id.display_name,
      sender_image: msg.sender_id.profile_image_url,
      created_at: msg.created_at,
      is_read: msg.is_read
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      property: conversation.property_id ? {
        id: conversation.property_id._id,
        title: conversation.property_id.title,
        image: conversation.property_id.images[0]
      } : null
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};





exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Message.countDocuments({
      receiver_id: userId,
      is_read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
