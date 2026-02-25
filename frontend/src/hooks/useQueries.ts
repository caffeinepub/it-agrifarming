import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Plant } from '../backend';

export interface AssessPlantInput {
  imageBytes: Uint8Array;
  name?: string;
}

export function useAssessPlant() {
  const { actor } = useActor();

  return useMutation<Plant, Error, AssessPlantInput>({
    mutationFn: async ({ imageBytes, name = 'My Plant' }: AssessPlantInput) => {
      if (!actor) throw new Error('Backend not ready. Please try again.');
      const photo = ExternalBlob.fromBytes(
        imageBytes.buffer instanceof ArrayBuffer
          ? new Uint8Array(imageBytes.buffer as ArrayBuffer, imageBytes.byteOffset, imageBytes.byteLength)
          : new Uint8Array(imageBytes)
      );
      return actor.assessPlant({ name, photo });
    },
  });
}
