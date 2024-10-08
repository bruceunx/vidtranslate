use anyhow::{Error, Result};
use candle_core::{Device, Tensor};
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::quantized_t5 as t5;
use std::path::PathBuf;
use tokenizers::Tokenizer;

#[derive(Debug, Clone)]
struct ModelConfig {
    config_file: String,
    tokenizer_file: String,
    weight_file: String,
    temperature: f64,
}

impl Default for ModelConfig {
    fn default() -> Self {
        ModelConfig {
            config_file: String::from("/Users/bruce/Download/config.json"),
            tokenizer_file: String::from("/Users/bruce/Download/tokenizer.json"),
            weight_file: String::from("/Users/bruce/Download/model-q4k.gguf"),
            temperature: 0.8,
        }
    }
}

struct T5ModelBuilder {
    device: Device,
    config: t5::Config,
    weights_filename: PathBuf,
}

#[allow(unused_assignments)]
impl T5ModelBuilder {
    pub fn load(args: &ModelConfig) -> Result<(Self, Tokenizer)> {
        let mut device = Device::Cpu;

        if cfg!(feature = "cuda") {
            device = Device::new_cuda(0)?;
        }

        if cfg!(target_os = "macos") {
            device = Device::new_metal(0)?;
        }

        let config_filename = Self::get_local_or_remote_file(&args.config_file)?;
        let tokenizer_filename = Self::get_local_or_remote_file(&args.tokenizer_file)?;
        let weights_filename = Self::get_local_or_remote_file(&args.weight_file)?;

        let config = std::fs::read_to_string(config_filename)?;
        let mut config: t5::Config = serde_json::from_str(&config)?;
        config.use_cache = false;
        let tokenizer = Tokenizer::from_file(tokenizer_filename).map_err(Error::msg)?;
        Ok((
            Self {
                device,
                config,
                weights_filename,
            },
            tokenizer,
        ))
    }

    pub fn build_model(&self) -> Result<t5::T5ForConditionalGeneration> {
        let device = &self.device;
        let vb = t5::VarBuilder::from_gguf(&self.weights_filename, &device)?;
        Ok(t5::T5ForConditionalGeneration::load(vb, &self.config)?)
    }

    fn get_local_or_remote_file(filename: &str) -> Result<PathBuf> {
        let local_filename = std::path::PathBuf::from(filename);
        Ok(local_filename)
    }
}
fn main() -> Result<()> {
    let model_config = ModelConfig::default();
    let (builder, mut tokenizer) = T5ModelBuilder::load(&model_config)?;
    let device = &builder.device;
    let tokenizer = tokenizer
        .with_padding(None)
        .with_truncation(None)
        .map_err(Error::msg)?;

    let mut model = builder.build_model()?;
    let temperature = if model_config.temperature <= 0. {
        None
    } else {
        Some(model_config.temperature)
    };
    let mut logits_processor = LogitsProcessor::new(299792458, temperature, Some(0.95));

    let prompts = vec![
        "<2zh> hello world!",
        "<2zh> how are you today?",
        "<2zh> can you suggest any new movie?",
        "<2zh> what about this movie?",
    ];

    for prompt in prompts {
        println!("{}", &prompt);
        let mut output_token_ids = [builder
            .config
            .decoder_start_token_id
            .unwrap_or(builder.config.pad_token_id) as u32]
        .to_vec();
        let tokens = tokenizer
            .encode(prompt, true)
            .map_err(Error::msg)?
            .get_ids()
            .to_vec();
        let input_token_ids = Tensor::new(&tokens[..], device)?.unsqueeze(0)?;
        let encoder_output = model.encode(&input_token_ids)?;

        let mut output_string = String::new();
        let start = std::time::Instant::now();
        for index in 0.. {
            if output_token_ids.len() > 512 {
                break;
            }
            let decoder_token_ids = if index == 0 || !builder.config.use_cache {
                Tensor::new(output_token_ids.as_slice(), device)?.unsqueeze(0)?
            } else {
                let last_token = *output_token_ids.last().unwrap();
                Tensor::new(&[last_token], device)?.unsqueeze(0)?
            };
            let logits = model
                .decode(&decoder_token_ids, &encoder_output)?
                .squeeze(0)?;

            let next_token_id = logits_processor.sample(&logits)?;
            if next_token_id as usize == builder.config.eos_token_id {
                break;
            }
            output_token_ids.push(next_token_id);
            if let Some(text) = tokenizer.id_to_token(next_token_id) {
                let text = text.replace('▁', " ").replace("<0x0A>", "\n");
                output_string += &text;
            }
        }
        let dt = start.elapsed();
        println!(
            "{} tokens generated ({:.2} token/s)",
            output_token_ids.len(),
            output_token_ids.len() as f64 / dt.as_secs_f64(),
        );
        println!("{}", output_string);
    }
    Ok(())
}
