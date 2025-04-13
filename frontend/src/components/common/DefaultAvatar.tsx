import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface DefaultAvatarProps {
  avatarUrl?: string;
  className?: string;
  size?: number | 'large' | 'small' | 'default';
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ avatarUrl, className, size = 'default' }) => {
  const baseUrl = 'http://localhost:8080';
  const defaultAvatarPath = '/assets/images/default-avatar.png';

  return (
    <Avatar
      size={size}
      icon={<UserOutlined />}
      src={avatarUrl ? `${baseUrl}${avatarUrl}` : defaultAvatarPath}
      className={className}
    />
  );
};

export default DefaultAvatar; 