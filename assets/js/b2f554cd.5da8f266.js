"use strict";(self.webpackChunkmy_blog=self.webpackChunkmy_blog||[]).push([[1477],{10:e=>{e.exports=JSON.parse('{"blogPosts":[{"id":"LoRA ~ Low-Rank Adaptation","metadata":{"permalink":"/blog/LoRA ~ Low-Rank Adaptation","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/LoRA/LoRA.md","source":"@site/blog/LoRA/LoRA.md","title":"LoRA ~ Low-Rank Adaptation","description":"Fine Tuning models such as GPT-3 ( 175B ) from scratch requires lot of compute which is very costly. Low Rank Adaptation ( LoRA ) freezes the pretrained model weights & injects trainable rank decomposition matrices. These matrices are injected into each layer of the Transformer architecture. This reduces the number of trainable parameters for downstream tasks.","date":"2023-09-23T15:10:05.552Z","formattedDate":"September 23, 2023","tags":[{"label":"LoRA","permalink":"/blog/tags/lo-ra"},{"label":"Large Language Models","permalink":"/blog/tags/large-language-models"}],"readingTime":7.655,"hasTruncateMarker":false,"authors":[{"name":"Samuel Davis","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"}],"frontMatter":{"slug":"LoRA ~ Low-Rank Adaptation","title":"LoRA ~ Low-Rank Adaptation","authors":{"name":"Samuel Davis","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"},"tags":["LoRA","Large Language Models"]},"nextItem":{"title":"Welcome","permalink":"/blog/welcome"}},"content":"Fine Tuning models such as GPT-3 ( 175B ) from scratch requires lot of compute which is very costly. **Lo**w **R**ank **A**daptation ( **LoRA** ) freezes the pretrained model weights & injects trainable rank decomposition matrices. These matrices are injected into each layer of the Transformer architecture. This reduces the number of trainable parameters for downstream tasks.\\n\\n> Compared to GPT-3 175B fine-tuned with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times.\\n> \\n\\nLoRA allows us to train some dense layers in a neural network indirectly by optimizing rank decomposition matrices of the dense layers\u2019 change during\\nadaptation instead, while keeping the pre-trained weights frozen\\n\\n**Advantages**\\n    \\n\u2192 A pre-trained model can be shared to build LoRA modules for different tasks. We can freeze the shared model and efficiently switch tasks by replacing the matrices *A* and *B,* reducing the storage requirement and task-switching overhead significantly.\\n\\n\u2192 LoRA makes training more efficient and lowers the hardware barrier to entry by up to 3 times when using adaptive optimizers since we do not need to calculate the gradients or maintain the optimizer states for most parameters. Instead, we only optimize the injected, much smaller low-rank matrices.\\n\\n\u2192 The simple linear design allows us to merge the trainable matrices with the frozen weights when deployed, *introducing no inference latency* compared to a fully fine-tuned model, by construction.\\n\\n\u2192 LoRA is orthogonal to many prior methods and can be combined with many of them, such as prefix-tuning.\\n    \\n\\nRead From [here](https://www.ml6.eu/blogpost/low-rank-adaptation-a-technical-deep-dive#:~:text=The%20main%20idea%20behind%20LoRA,a%20low%2Drank%20matrix%20i.e.) and explain details of LoRA\\n\\n---\\n\\nDuring full fine-tuning, the model is initialized to pre-trained weights \u03a60 and updated to \u03a60 + \u2206\u03a6 by repeatedly following the gradient to maximize the conditional language modeling objective:\\n\\n![Untitled](./imgs/fine%20tuning.png)\\n\\nOne of the main drawbacks for full fine-tuning is that for *each* downstream task, we learn a *different* set of parameters \u2206\u03a6 whose dimension *|*\u2206\u03a6*|* equals *|*\u03a60*|*.\\n\\nIf a model has weight matrices of size WxH then the delta will also be of the same dimension. Therefore, while finetuning if there is a model with dimension 175B then the delta will also require a storage space to save these gradients of size 175B before updating the weights.\\n\\nMoreover, storing and deploying many independent instances of fine-tuned models can be challenging, if at all feasible.\\n\\nIn this paper, we adopt a more parameter-efficient approach, where the task-specific parameter increment \u2206\u03a6 = \u2206\u03a6(\u0398) is further **encoded by a much smaller-sized set of parameters** \u0398 with *|*\u0398*| << |*\u03a60*|*. \\n\\nThe task of finding \u2206\u03a6 thus becomes optimizing over \u0398:\\n\\n![Untitled](./imgs/updated-eq.png)\\n\\nThe authors propose to use a low-rank representation to encode \u2206\u03a6 that is both **compute- and memory-efficient**. \\n\\nWhen the pre-trained model is GPT-3 175B, the number of train able parameters *|*\u0398*|* can be as small as 0*.*01% of *|*\u03a60*|* ( 175B \u2192 17.5M ).\\n\\nAren\u2019t Existing Solutions Good Enough?\\n\\nThis issue has been there since *Transfer Learning* \\n\\nMany techniques have been developed trying to tackle this. From Language Modelling POV, there are two strategies:\\n\\n\u2192 Adding Adapter layers\\n\\n\u2192 Optimizing some forms of the input layer activation\\n\\nHowever, there are limitations to them\\n\\n**Adding Adapter layers** \u2192 Introduces Inference Latency\\n\\n\u2192 One can think of reducing the latency by either pruning the layers or by exploiting multi-task settings but there is no direct way to bypass the extra compute that the adapters add in. It might seem that its fine as the adapters have few parameters (almost < 1% of the model) due to bottleneck dimensions, which limits the FLOPs they can add. Large Neural Networks rely on GPU parallelism to keep the latency low, **adapter layers have to be processed sequentially**. On performing inference using GPT-2 medium on a single GPU (scenario without model parallelism),\\n\\nwe see a noticeable increase in latency when using adapters, even with a very small bottleneck dimension\\n\\n![Untitled](./imgs/adapter%20L-H%20issues.png)\\n\\n---\\n\\n**LoRA**\\n\\n\u2192 LOW-RANK-PARAMETRIZED UPDATE MATRICES\\n\\nA neural network contains many dense layers which perform matrix multiplication. The weight\\nmatrices in these layers typically have **full-rank.**\\n\\n**Lets check out Ranks first**\\n    \\nMatrix Rank\\n\\nThe\xa0**rank of a matrix**\xa0is the dimension of the vector space generated by its columns, which is given by the\xa0**number of\xa0linearly independent\xa0columns (or rows) in a given matrix.**\xa0\\n\\nIt can be proven that the number of independent columns (known as\xa0*column rank)*\xa0is always equal to the number of independent rows (called\xa0*row rank)*. Hence, for a matrix\xa0***A***\xa0with\xa0***m***\xa0rows and\xa0***n***\xa0columns (represented as\xa0***A\u2098\u2099**)*,\\n\\n![Untitled](./imgs/rank%20matrix.png)\\n\\n**Linear Dependence & Independence**\\n\\nIn the theory of\xa0[vector spaces](https://en.wikipedia.org/wiki/Vector_space), a\xa0[set](https://en.wikipedia.org/wiki/Set_(mathematics))\xa0of\xa0[vectors](https://en.wikipedia.org/wiki/Vector_(mathematics))\xa0is said to be\xa0**linearly independent**\xa0if there exists no nontrivial\xa0[linear combination](https://en.wikipedia.org/wiki/Linear_combination)\xa0of the vectors that equals the zero vector.\\n\\n\u2192 Linear Dependent\\n\\n![Untitled](./imgs/Linear%20Dependent%20vectors.png)\\n\\n\u2192 Linear Independent\\n\\n![Untitled](./imgs/Linear%20Independent%20Vectors.png)\\n\\nCan only be satisfied if a(i) = 0 for i = 1,\u2026,n\\n    \\n\\nBased on these Ranks matrices can be classified into 2 types:\\n\\n\u2192 Full Rank\\n\\nA matrix\xa0***A\u2098\u2099***\xa0is called a\xa0**full-rank matrix**\xa0if\xa0***rank(A) =*\xa0*min(m, n)*.**\xa0The matrix shown below is an example of a full rank matrix.\\n\\n![Untitled](./imgs/full%20rank.png)\\n\\n\u2192 Rank Deficient\\n\\nThe opposite of a full rank matrix is\xa0**rank deficient**\xa0i.e.\xa0***rank(A)*\xa0<\xa0*min(m, n)***. The rank-deficient matrix shown below has a rank of\xa0***1***, as the columns (or rows) of the matrix are not linearly independent of one another.\\n\\n![Untitled](./imgs/rank%20deficient.png)\\n\\n*L**ow-Rank Matrix**: A rank-deficient matrix\xa0**A\u2098\u2099**\xa0is called a low-rank matrix if its rank is significantly lower (no fixed threshold) than the minimum number of rows and columns. Mathematically,\xa0**rank(A) << min(m, n)**.*\\n\\nRank Decomposition\\n\\nRank decomposition or factorization of a matrix\xa0***A\u2098\u2099***\xa0is the factorization of\xa0***A***\xa0of the form\xa0***A***\xa0***= C\u2098\u1d63F\u1d63\u2099***\xa0where\xa0***rank(A) =*\xa0*r***. It can be proven that every (finite) matrix has a rank decomposition. \\n\\nTechniques like\xa0SVD\xa0(Singular Value Decomposition) can be used to construct such a decomposition.\\n    \\n\\nWhen adapting to a task the pretrained model weights have \u201clow intrinsic dimensions\u201d. When adapting to a specific task (fine-tuning) we just randomly project it to a smaller subspace still it learns efficiently. Hence it can be hypothesized that the change in weights (update) also has a \u201clow intrinsic dimensions/rank\u201d. \\n\\nTherefore, we can use rank decomposition for the change in weights.\\n\\n![Untitled](./imgs/lora-rankdecomposition.png)\\n\\nE.g.\\n\\nIf d = 100 & k = 100\\n\\nthen d * k = 10000\\n\\nNow, if r ~ 5\\n\\nthen ( d * r ) + ( r * k ) = ( 500 ) + ( 500 ) = 1000\\n\\nIts clear that how this reduces the storage requirements.\\n\\nInitial Initialization,\\n\\nA \u2192 Random Gaussian initialization\\n\\nB \u2192 0\\n\\nTherefore, initially AB \u2192 0. Moreover, it also scaled by (*alpha / rank*)\\n\\nWhere *alpha* is a constant (this is set to the first selected rank). This helps to reduce the need to retune hyperparameters when varying *rank*\\n\\nLatency\\n\\n![Untitled](./imgs/Latency.png)\\n\\nInstead of saving 2 entire different models we use a shared pretrained model with task related adapters.\\n\\n**Practical Benefits & Limitations**\\n\\n\u2192 The most significant benefit comes from the reduction in memory and storage usage as we do not need to store the optimizer states for the frozen parameters. This saves a lot of VRAM.\\n\\n\u2192 The size of the checkpoint also significantly reduces. \\n\\n\u2192 Another benefit is that we can switch between tasks while deployed at a much lower cost by only swapping the LoRA weights as opposed to all the parameters.\\n\\nFor GPT 3 175B, a speedup of 25% was observed for training compared to full fine-tuning.\\n\\nLimitations\\n\\n\u2192 It is not straightforward to batch inputs to different tasks with different *A* and *B* in a single forward pass.\\n\\n---\\n\\nStorage Reduction\\n\\n![Untitled](./imgs/storage%20reduction.png)\\n\\n**UNDERSTANDING THE LOW-RANK UPDATES**\\n\\nWHICH WEIGHT MATRICES IN TRANSFORMER SHOULD WE APPLY LORA TO?\\n\\n![Untitled](./imgs/identifying%20weights%20to%20use%20LoRA.png)\\n\\nThis is for GPT 3 175B, the budget for trainable parameters is set to 18M which ~ 35MB in FP16 storage.\\n\\nThe above figure shows us that:\\n\\n\u2192 Wq, Wv ~ Gives the best performance.\\n\\nThe figure suggests that even a rank of four captures enough information in \u2206*W* such that it is preferable to adapt more weight matrices than adapting a single type of weights with a larger rank.\\n\\nWHAT IS THE OPTIMAL RANK *r* FOR LORA?\\n\\n![Untitled](./imgs/optimal%20rank.png)\\n\\nLoRA already performs competitively with a very small *r* (more so for *{Wq, Wv}* than just *Wq*)\\n\\nThis suggests the update matrix \u2206*W* could have a very small **intrinsic rank**\\n\\nTo further support this finding, the authors checked the overlap of the subspaces learned by different choices of *r* and by different random seeds.\\n\\nThe authors argue that increasing *r* does not cover a more meaningful subspace, which suggests that a low-rank adaptation matrix is sufficient.\\n\\nHOW DOES THE ADAPTATION MATRIX \u2206*W* COMPARE TO *W* ?\\n\\n![Untitled](./imgs/delta%20W%20vs%20W%20-%20part%201.png)\\n\\nNote: There are detailed figures regarding these studies in the Appendix section of the paper\\n\\n![Untitled](./imgs/delta%20W%20and%20W%20-%20part%202.png)\\n\\nConclusion from the above figure:\\n\\n\u2192 \u2206*W* has a stronger correlation with *W* compared to a random matrix, indicating that \u2206*W* amplifies some features that are already in *W*.\\n\\n\u2192 \u2206*W ~ 0.32 | W ~ 21.67*\\n\\n\u2192 Random ~ 0.02 | *W ~ 21.67*\\n\\n\u2192 Instead of repeating the top singular directions of *W*, \u2206*W* only *amplifies directions that are not emphasized in W.*\\n\\n\u2192 The amplification factor is rather huge: \\n\\n\u2192 21*.*5 *\u2248* 6*.*91*/*0*.*32 for *r* = 4 when compared to *r* = 64\\n\\nThis suggests that the low-rank adaptation matrix potentially ***amplifies the important features for specific downstream tasks that were learned but not emphasized in the general pre-training model***."},{"id":"welcome","metadata":{"permalink":"/blog/welcome","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2021-08-26-welcome/index.md","source":"@site/blog/2021-08-26-welcome/index.md","title":"Welcome","description":"Docusaurus blogging features are powered by the blog plugin.","date":"2021-08-26T00:00:00.000Z","formattedDate":"August 26, 2021","tags":[{"label":"facebook","permalink":"/blog/tags/facebook"},{"label":"hello","permalink":"/blog/tags/hello"},{"label":"docusaurus","permalink":"/blog/tags/docusaurus"}],"readingTime":0.405,"hasTruncateMarker":false,"authors":[{"name":"S\xe9bastien Lorber","title":"Docusaurus maintainer","url":"https://sebastienlorber.com","imageURL":"https://github.com/slorber.png","key":"slorber"},{"name":"Yangshun Tay","title":"Front End Engineer @ Facebook","url":"https://github.com/yangshun","imageURL":"https://github.com/yangshun.png","key":"yangshun"}],"frontMatter":{"slug":"welcome","title":"Welcome","authors":["slorber","yangshun"],"tags":["facebook","hello","docusaurus"]},"prevItem":{"title":"LoRA ~ Low-Rank Adaptation","permalink":"/blog/LoRA ~ Low-Rank Adaptation"},"nextItem":{"title":"MDX Blog Post","permalink":"/blog/mdx-blog-post"}},"content":"[Docusaurus blogging features](https://docusaurus.io/docs/blog) are powered by the [blog plugin](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog).\\n\\nSimply add Markdown files (or folders) to the `blog` directory.\\n\\nRegular blog authors can be added to `authors.yml`.\\n\\nThe blog post date can be extracted from filenames, such as:\\n\\n- `2019-05-30-welcome.md`\\n- `2019-05-30-welcome/index.md`\\n\\nA blog post folder can be convenient to co-locate blog post images:\\n\\n![Docusaurus Plushie](./docusaurus-plushie-banner.jpeg)\\n\\nThe blog supports tags as well!\\n\\n**And if you don\'t want a blog**: just delete this directory, and use `blog: false` in your Docusaurus config."},{"id":"mdx-blog-post","metadata":{"permalink":"/blog/mdx-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2021-08-01-mdx-blog-post.mdx","source":"@site/blog/2021-08-01-mdx-blog-post.mdx","title":"MDX Blog Post","description":"Blog posts support Docusaurus Markdown features, such as MDX.","date":"2021-08-01T00:00:00.000Z","formattedDate":"August 1, 2021","tags":[{"label":"docusaurus","permalink":"/blog/tags/docusaurus"}],"readingTime":0.175,"hasTruncateMarker":false,"authors":[{"name":"S\xe9bastien Lorber","title":"Docusaurus maintainer","url":"https://sebastienlorber.com","imageURL":"https://github.com/slorber.png","key":"slorber"}],"frontMatter":{"slug":"mdx-blog-post","title":"MDX Blog Post","authors":["slorber"],"tags":["docusaurus"]},"prevItem":{"title":"Welcome","permalink":"/blog/welcome"},"nextItem":{"title":"Long Blog Post","permalink":"/blog/long-blog-post"}},"content":"Blog posts support [Docusaurus Markdown features](https://docusaurus.io/docs/markdown-features), such as [MDX](https://mdxjs.com/).\\n\\n:::tip\\n\\nUse the power of React to create interactive blog posts.\\n\\n```js\\n<button onClick={() => alert(\'button clicked!\')}>Click me!</button>\\n```\\n\\n<button onClick={() => alert(\'button clicked!\')}>Click me!</button>\\n\\n:::"},{"id":"long-blog-post","metadata":{"permalink":"/blog/long-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2019-05-29-long-blog-post.md","source":"@site/blog/2019-05-29-long-blog-post.md","title":"Long Blog Post","description":"This is the summary of a very long blog post,","date":"2019-05-29T00:00:00.000Z","formattedDate":"May 29, 2019","tags":[{"label":"hello","permalink":"/blog/tags/hello"},{"label":"docusaurus","permalink":"/blog/tags/docusaurus"}],"readingTime":2.05,"hasTruncateMarker":true,"authors":[{"name":"Endilie Yacop Sucipto","title":"Maintainer of Docusaurus","url":"https://github.com/endiliey","imageURL":"https://github.com/endiliey.png","key":"endi"}],"frontMatter":{"slug":"long-blog-post","title":"Long Blog Post","authors":"endi","tags":["hello","docusaurus"]},"prevItem":{"title":"MDX Blog Post","permalink":"/blog/mdx-blog-post"},"nextItem":{"title":"First Blog Post","permalink":"/blog/first-blog-post"}},"content":"This is the summary of a very long blog post,\\n\\nUse a `\x3c!--` `truncate` `--\x3e` comment to limit blog post size in the list view.\\n\\n\x3c!--truncate--\x3e\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet"},{"id":"first-blog-post","metadata":{"permalink":"/blog/first-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2019-05-28-first-blog-post.md","source":"@site/blog/2019-05-28-first-blog-post.md","title":"First Blog Post","description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet","date":"2019-05-28T00:00:00.000Z","formattedDate":"May 28, 2019","tags":[{"label":"hola","permalink":"/blog/tags/hola"},{"label":"docusaurus","permalink":"/blog/tags/docusaurus"}],"readingTime":0.12,"hasTruncateMarker":false,"authors":[{"name":"Gao Wei","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"}],"frontMatter":{"slug":"first-blog-post","title":"First Blog Post","authors":{"name":"Gao Wei","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"},"tags":["hola","docusaurus"]},"prevItem":{"title":"Long Blog Post","permalink":"/blog/long-blog-post"}},"content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet"}]}')}}]);