import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { FieldError, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();
  const inputFileRef = useRef<HTMLInputElement>();

  const formValidations = {
    image: {
      // TODO REQUIRED, LESS THAN 10 MB AND ACCEPTED FORMATS VALIDATIONS
      required: 'Imagem invalida',
      validate: {
        lessThan10MB: ref => {
          const [file] = ref;
          return ref.length && file.size < 100000;
        }, // validar size do arquivo se for maior que 10mb
        acceptedFormats: ref => {
          const [file] = ref;
          return ref.length && /\.(jpe?g|png|gif|bmp)$/i.test(file.name);
        }, // validar se o tipo do arquivo for diferente de  PNG, JPEG e GIF.
      },
    },
    title: {
      // TODO REQUIRED, MIN AND MAX LENGTH VALIDATIONS
      required: 'Title invalida',
      min: 3,
      max: 10,
    },
    description: {
      // TODO REQUIRED, MAX LENGTH VALIDATIONS
      required: 'Description invalida',
      max: 10,
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (values: Record<string, unknown>) => {
      const { data } = await api.post('/api/images', {
        ...values,
        url: imageUrl,
      });

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Image url nao existe',
          description: 'Ocorreu um erro ao encontrar a url da image.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      mutation.mutateAsync(data);

      toast({
        title: 'Upload Completo',
        description: 'Sucesso em fazer o upload da imagem',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Erro ao fazer upload',
        description: 'Ocorreu um erro ao fazer o upload da image.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          ref={inputFileRef}
          error={errors.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          // TODO SEND TITLE ERRORS
          {...register('title', formValidations.title)}
          error={errors.title}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          // TODO SEND DESCRIPTION ERRORS
          {...register('description', formValidations.description)}
          error={errors.title}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
