// Dontup: comportamento da página de lançamento. Sem dependências.
(() => {
  const cfg = window.DONTUP || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  document.documentElement.classList.add('js');

  // Textos configuráveis
  if (cfg.inauguracao) $$('[data-inauguracao]').forEach((el) => { el.textContent = cfg.inauguracao; });
  $$('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Botão "Acessar sistema": link real quando houver endereço, senão bloqueado com aviso.
  $$('[data-acesso]').forEach((caixa) => {
    const btn = $('[data-sistema]', caixa);
    if (cfg.sistemaUrl) {
      btn.href = cfg.sistemaUrl;
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('role');
      btn.removeAttribute('aria-describedby');
      $('.dica', caixa).remove();
      $('svg', btn).remove();
      return;
    }
    let t;
    const avisa = (e) => {
      e.preventDefault();
      caixa.classList.remove('treme');
      void caixa.offsetWidth;
      caixa.classList.add('treme', 'mostra');
      clearTimeout(t);
      t = setTimeout(() => caixa.classList.remove('mostra', 'treme'), 2200);
    };
    btn.addEventListener('click', avisa);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') avisa(e); });
  });

  // Lista de espera: formulário externo, WhatsApp ou aviso.
  const msgLista = $('[data-lista-msg]');
  $$('[data-lista]').forEach((btn) => {
    if (cfg.listaEsperaUrl) { btn.href = cfg.listaEsperaUrl; btn.target = '_blank'; btn.rel = 'noopener'; return; }
    if (cfg.whatsapp) {
      btn.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent('Olá! Quero ser avisado da inauguração do Dontup.')}`;
      btn.target = '_blank'; btn.rel = 'noopener';
      return;
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      msgLista.textContent = 'A lista de espera abre junto com o anúncio da data. Volte em breve.';
    });
  });

  // Topo: fundo ao rolar e seção ativa no menu
  const topo = $('#topo');
  const aoRolar = () => topo.classList.toggle('rolou', scrollY > 12);
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  const links = $$('.menu a');
  const secoes = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const obsMenu = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (it.isIntersecting) links.forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + it.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secoes.forEach((s) => obsMenu.observe(s));

  // Menu no celular
  const menuBtn = $('.menu-btn');
  const menuMovel = $('#menu-movel');
  const fechaMenu = () => { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); menuMovel.hidden = true; };
  menuBtn.addEventListener('click', () => {
    const abrir = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(abrir));
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    menuMovel.hidden = !abrir;
  });
  $$('a', menuMovel).forEach((a) => a.addEventListener('click', fechaMenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuMovel.hidden) { fechaMenu(); menuBtn.focus(); } });

  // Entrada do topo
  const fontes = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
  fontes.then(() => requestAnimationFrame(() => document.body.classList.add('carregou')));

  // Funil ao vivo
  const quadro = $('[data-quadro]');
  const cols = $$('.cartoes', quadro);
  const toast = $('[data-toast]');
  const kpi = { aberto: $('[data-kpi="aberto"]'), ganho: $('[data-kpi="ganho"]'), meta: $('[data-kpi="meta"]') };
  const META = 60000;
  let ganhoMes = 18400;
  const pessoas = [
    ['Juliana R.', 'Implante', 4800], ['Carlos M.', 'Clareamento', 1200], ['Beatriz L.', 'Aparelho', 3600],
    ['Rafael T.', 'Canal', 1450], ['Fernanda O.', 'Lentes', 9600], ['Lucas A.', 'Restauração', 380],
    ['Marina C.', 'Clareamento', 1200], ['Pedro H.', 'Prótese', 5200], ['Sofia N.', 'Limpeza', 220],
    ['Gustavo P.', 'Implante', 5100], ['Helena V.', 'Aparelho', 3900], ['Thiago B.', 'Canal', 1600],
  ];
  let proxima = 0;
  const novoCartao = () => {
    const [n, p, v] = pessoas[proxima++ % pessoas.length];
    const c = document.createElement('div');
    c.className = 'cartao';
    c.dataset.v = v;
    c.innerHTML = '<b></b><span></span><em></em>';
    c.children[0].textContent = n;
    c.children[1].textContent = p;
    c.children[2].textContent = brl(v);
    return c;
  };
  [0, 0, 1, 1, 2, 3].forEach((col) => cols[col].append(novoCartao()));

  const animarNumero = (el, de, para) => {
    if (calmo) { el.textContent = brl(para); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 900);
      el.textContent = brl(de + (para - de) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  let abertoAtual = 0;
  let ganhoAtual = 0;
  const atualizaKpis = () => {
    const aberto = cols.slice(0, 3).flatMap((c) => [...c.children]).reduce((s, c) => s + +c.dataset.v, 0);
    animarNumero(kpi.aberto, abertoAtual, aberto); abertoAtual = aberto;
    animarNumero(kpi.ganho, ganhoAtual, ganhoMes); ganhoAtual = ganhoMes;
    kpi.meta.style.width = Math.min(100, (ganhoMes / META) * 100) + '%';
  };
  atualizaKpis();

  let tToast;
  const avisar = (txt) => {
    toast.textContent = txt;
    toast.classList.add('on');
    clearTimeout(tToast);
    tToast = setTimeout(() => toast.classList.remove('on'), 2600);
  };

  // Move com FLIP: mede antes, muda o DOM, anima a diferença.
  const mover = (mudar) => {
    const todos = $$('.cartao', quadro);
    const antes = new Map(todos.map((c) => [c, c.getBoundingClientRect()]));
    mudar();
    $$('.cartao', quadro).forEach((c) => {
      const a = antes.get(c);
      const d = c.getBoundingClientRect();
      if (!a) { c.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.7,.1,1)' }); return; }
      const dx = a.left - d.left, dy = a.top - d.top;
      if (!dx && !dy) return;
      c.classList.add('movendo');
      c.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(${dx ? -3 : 0}deg)` }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(.2,.7,.1,1)' })
        .finished.then(() => c.classList.remove('movendo'));
    });
  };

  let passo = 0;
  const ciclo = () => {
    passo++;
    // Prioridade: fechar quem está em avaliação; senão avançar o funil; de vez em quando, chega lead novo.
    if (passo % 4 === 0) {
      mover(() => cols[0].prepend(novoCartao()));
      avisar('Novo pedido pelo link de captação');
    } else if (cols[2].children.length) {
      const c = cols[2].firstElementChild;
      mover(() => cols[3].prepend(c));
      c.classList.add('chegou');
      setTimeout(() => c.classList.remove('chegou'), 800);
      ganhoMes += +c.dataset.v;
      avisar(`${c.children[0].textContent} fechou: ${brl(+c.dataset.v)}`);
    } else if (cols[1].children.length) {
      mover(() => cols[2].append(cols[1].firstElementChild));
      avisar('Avaliação marcada pela recepção');
    } else if (cols[0].children.length) {
      mover(() => cols[1].append(cols[0].firstElementChild));
      avisar('Orçamento parado há 2 dias: hora de ligar');
    }
    // Mantém o quadro enxuto
    while (cols[3].children.length > 3) cols[3].lastElementChild.remove();
    while (cols[0].children.length > 3) cols[0].lastElementChild.remove();
    if (ganhoMes > META * 1.05) ganhoMes = 14200;
    atualizaKpis();
  };
  let relogio = null;
  const liga = () => { if (!relogio && !calmo) relogio = setInterval(ciclo, 2600); };
  const desliga = () => { clearInterval(relogio); relogio = null; };
  new IntersectionObserver(([e]) => (e.isIntersecting ? liga() : desliga()), { threshold: .2 }).observe(quadro);
  document.addEventListener('visibilitychange', () => (document.hidden ? desliga() : null));

  // Explorador de recursos (abas acessíveis)
  const abas = $$('[role="tab"]');
  const selecionar = (aba, foco) => {
    abas.forEach((a) => {
      const ativo = a === aba;
      a.setAttribute('aria-selected', String(ativo));
      a.tabIndex = ativo ? 0 : -1;
      const p = document.getElementById(a.getAttribute('aria-controls'));
      p.hidden = !ativo;
      p.classList.remove('entra');
      if (ativo) { void p.offsetWidth; p.classList.add('entra'); }
    });
    if (foco) aba.focus();
    if (matchMedia('(max-width: 960px)').matches) aba.scrollIntoView({ block: 'nearest', inline: 'center', behavior: calmo ? 'auto' : 'smooth' });
  };
  abas.forEach((a, i) => {
    a.addEventListener('click', () => selecionar(a));
    a.addEventListener('keydown', (e) => {
      const mapa = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in mapa) { e.preventDefault(); selecionar(abas[(i + mapa[e.key] + abas.length) % abas.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selecionar(abas[0], true); }
      if (e.key === 'End') { e.preventDefault(); selecionar(abas[abas.length - 1], true); }
    });
  });
  // Primeira aba anima quando o explorador aparece
  const explorador = $('[data-explorador]');
  const obsExp = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    $('.painel-aba:not([hidden])').classList.add('entra');
    obsExp.disconnect();
  }, { threshold: .25 });
  obsExp.observe(explorador);

  // Formulário de captação no celular: digita, envia, recomeça.
  const campos = $$('[data-digita]');
  const enviar = $('[data-envia]');
  let rodandoCel = false;
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const digitar = async (el) => {
    el.classList.add('digitando');
    const txt = el.dataset.digita;
    for (let i = 1; i <= txt.length; i++) { el.textContent = txt.slice(0, i); await espera(55 + Math.random() * 50); }
    el.classList.remove('digitando');
    await espera(250);
  };
  const celular = async () => {
    if (rodandoCel) return;
    rodandoCel = true;
    while (rodandoCel) {
      campos.forEach((c) => { c.textContent = ''; });
      enviar.textContent = 'Quero ser contatado';
      enviar.classList.remove('ok');
      await espera(700);
      for (const c of campos) { if (!rodandoCel) return; await digitar(c); }
      enviar.classList.add('aperta'); await espera(160); enviar.classList.remove('aperta');
      enviar.textContent = 'Pedido enviado. A clínica vai te chamar.';
      enviar.classList.add('ok');
      await espera(3200);
    }
  };
  if (calmo) {
    campos.forEach((c) => { c.textContent = c.dataset.digita; });
  } else {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) celular(); else rodandoCel = false; }, { threshold: .4 }).observe($('.celular'));
  }

  // Revelação suave de blocos de leitura e da trilha de passos
  const revelar = [...$$('.cabeca'), $('.op-txt'), $('.op-captacao'), ...$$('.colunas > div'), ...$$('.plano'), $('.seg-grade'), ...$$('.trilha li')].filter(Boolean);
  revelar.forEach((el) => el.setAttribute('data-revela', ''));
  const obs = new IntersectionObserver((itens) => itens.forEach((it) => {
    if (!it.isIntersecting) return;
    const irmaos = [...it.target.parentElement.children].filter((x) => x.hasAttribute('data-revela'));
    it.target.style.transitionDelay = Math.max(0, irmaos.indexOf(it.target)) * 80 + 'ms';
    it.target.classList.add('visivel');
    obs.unobserve(it.target);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  revelar.forEach((el) => obs.observe(el));
  const trilha = $('.trilha');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { trilha.classList.add('visivel'); o.disconnect(); } }, { threshold: .4 }).observe(trilha);
})();
