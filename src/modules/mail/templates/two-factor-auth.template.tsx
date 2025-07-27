import React from 'react';
import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Section,
} from '@react-email/components';

interface ITwoFactorAuthTemplateProps {
  token: string;
}

export function TwoFactorAuthTemplate({
  token,
}: ITwoFactorAuthTemplateProps): any {
  return (
    <Html>
      <Head />
      <Preview>Двухфакторная аутентификация</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 p-8 rounded-md shadow-md max-w-xl">
            <Heading className="text-2xl font-bold text-center text-gray-800 mb-6">
              Двухфакторная аутентификация
            </Heading>
            <Text className="text-gray-900 mb-4">
              Ваш код двухфакторной аутентификаций: <strong>{token}</strong>
            </Text>
            <Text className="text-gray-700 mb-4">
              Пожалуйста, введите этот код в приложений для завершения процесса
              аутентификаций.
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Если вы не запрашивали этот код, просто проигнорируйте это
              сообщение.
            </Text>

            <Text className="text-sm text-gray-600">
              Спасибо за использование нашего сервиса!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
