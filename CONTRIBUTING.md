# Guia de Contribuição

Obrigado por considerar contribuir para o projeto Digimon Evolution!

## Como Contribuir

### Reportar Bugs
1. Verifique se o bug já foi reportado nas Issues
2. Crie uma nova issue com template de bug
3. Inclua informações detalhadas para reproduzir

### Sugerir Funcionalidades
1. Verifique se já foi sugerida
2. Crie uma issue com template de feature
3. Descreva o caso de uso e benefícios

### Contribuir com Código
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça suas alterações
4. Adicione testes se necessário
5. Execute linting: `make lint`
6. Commit: `git commit -m 'feat: adicionar nova funcionalidade'`
7. Push: `git push origin feature/nova-funcionalidade`
8. Abra um Pull Request

## Padrões de Código

### Commits
Use [Conventional Commits](https://conventionalcommits.org/):
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

### JavaScript/React
- Use ESLint e Prettier
- Componentes em PascalCase
- Hooks com prefixo `use`
- Props com destructuring

### Docker
- Use multi-stage builds
- Minimize layers
- Use .dockerignore

## Ambiente de Desenvolvimento

### Setup
```bash
make install
make dev
```

### Testes
```bash
make test
make lint
```

### Docker
```bash
make build
make logs
make status
```

## Pull Request

### Checklist
- [ ] Código testado localmente
- [ ] Testes passando
- [ ] Linting sem erros
- [ ] Documentação atualizada
- [ ] Commit messages seguem padrão

### Review
- Mantenha PRs pequenos e focados
- Descreva as mudanças claramente
- Responda aos comentários rapidamente
- Seja respeitoso e construtivo

## Código de Conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/).
Seja respeitoso e inclusivo com todos os participantes.
