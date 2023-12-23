```python
!pip install transformers
```


```python
text = "The Golden State Warriors are an American professional basketball team based in San Francisco."
```


```python
from transformers import pipeline

classifier = pipeline("ner", model="stevhliu/my_awesome_wnut_model")
classifier(text)
```


    config.json:   0%|          | 0.00/1.14k [00:00<?, ?B/s]



    pytorch_model.bin:   0%|          | 0.00/266M [00:00<?, ?B/s]



    tokenizer_config.json:   0%|          | 0.00/360 [00:00<?, ?B/s]



    vocab.txt:   0%|          | 0.00/232k [00:00<?, ?B/s]



    tokenizer.json:   0%|          | 0.00/711k [00:00<?, ?B/s]



    special_tokens_map.json:   0%|          | 0.00/125 [00:00<?, ?B/s]





    [{'entity': 'B-location',
      'score': 0.42658585,
      'index': 2,
      'word': 'golden',
      'start': 4,
      'end': 10},
     {'entity': 'I-location',
      'score': 0.35856324,
      'index': 3,
      'word': 'state',
      'start': 11,
      'end': 16},
     {'entity': 'B-group',
      'score': 0.3064002,
      'index': 4,
      'word': 'warriors',
      'start': 17,
      'end': 25},
     {'entity': 'B-location',
      'score': 0.6552352,
      'index': 13,
      'word': 'san',
      'start': 80,
      'end': 83},
     {'entity': 'B-location',
      'score': 0.46686625,
      'index': 14,
      'word': 'francisco',
      'start': 84,
      'end': 93}]




```python

```
