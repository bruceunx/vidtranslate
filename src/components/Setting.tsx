import * as Dialog from '@radix-ui/react-dialog';
import { AiOutlineDownCircle, AiOutlineSetting } from 'react-icons/ai';
import ModelManager from './ModelManager';
import { Separator } from '@radix-ui/react-select';
import { useSettingData } from '../store/SettingContext';
import * as React from 'react';
import { ModelDetail } from '../types';
import ModelSelector from './ModelSelector';

const Settings = () => {
  const { state, setWhisperModel, setLlamaModel } = useSettingData();

  const [whisperModels, setWhisperModels] = React.useState<ModelDetail[]>([]);
  const [llamaModels, setLlamaModels] = React.useState<ModelDetail[]>([]);

  React.useEffect(() => {
    const hasWhisperModels = state.whisper_models.filter(
      (model) => model.localPath !== ''
    );
    setWhisperModels(hasWhisperModels);
    const hasLlamaModels = state.llama_models.filter(
      (model) => model.localPath !== ''
    );
    setLlamaModels(hasLlamaModels);
  }, [state]);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="hover:text-white">
          <AiOutlineSetting />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50  data-[state=open]:animate-[dialog-overlay-show_200ms]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2  -translate-y-1/2 rounded-lg bg-custome-gray-light shadow-md border border-gray-600 p-2 text-gray-300 data-[state=open]:animate-[dialog-content-show_200ms]">
          <Dialog.Title className="hidden">Settings</Dialog.Title>
          <Dialog.Description className="hidden"></Dialog.Description>
          <div className="flex flex-col space-y-5 mx-2 py-2">
            <div className="space-y-4">
              <div className="flex flex-row justify-between items-center">
                <p>Whisper Models</p>
                {whisperModels && (
                  <ModelSelector
                    models={whisperModels}
                    currentModel={state.currentWhisperModel}
                    setCurrentModel={setWhisperModel}
                  />
                )}
              </div>
              <Separator className="border-t border-gray-600 my-2" />
              <ModelManager
                models={state.whisper_models}
                modelType={'WHISPER'}
              />
            </div>
            <div className="flex flex-col space-y-5 mx-2 py-2">
              <div className="flex flex-row justify-between items-center">
                <p>Translate Model</p>
                {llamaModels && (
                  <ModelSelector
                    models={llamaModels}
                    currentModel={state.currentLlamaModel}
                    setCurrentModel={setLlamaModel}
                  />
                )}
              </div>
              <Separator className="border-t border-gray-600 my-2" />
              <ModelManager models={state.llama_models} modelType={'LLAMA'} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Settings;
