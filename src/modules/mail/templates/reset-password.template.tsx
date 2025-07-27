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

interface IResetPasswordTemplateProps {
  domain: string;
  token: string;
}

export function ResetPasswordTemplate({
  domain,
  token,
}: IResetPasswordTemplateProps): any {
  const resetLink: string = `${domain}/auth/new-password?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Сброс пароля</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 p-8 rounded-md shadow-md max-w-xl">
            <Heading className="text-2xl font-bold text-center text-gray-800 mb-6">
              Сброс пароля
            </Heading>

            <Text className="text-gray-700 mb-4">
              Привет! Чтобы сбросить свой пароль, пожалуйста, перейдите по
              следующей ссылке, чтобы создать новый пароль:
            </Text>

            <Section className="text-center mb-6">
              <Link
                href={resetLink}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md font-semibold"
              >
                Подтвердить сброс пароля
              </Link>
            </Section>

            <Text className="text-sm text-gray-600 mb-2">
              Эта ссылка действительна в течение 1 часа. Если вы не запрашивали
              сброс пароля, просто проигнорируйте это сообщение.
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
