import { ApiWrapper } from "./apiWrapper"
import { ScrapperWrapper } from "./scrapperWrapper"
import {
  Boletim,
  Credenciais,
  DetalhesNota,
  Documento,
  InformaçõesPessoais,
  PeríodoLetivo,
  ClienteSuapArgs
} from "./types"

export class ClienteSuap {
  private readonly apiWrapper: ApiWrapper
  private readonly scrapperWrapper: ScrapperWrapper
  public matrícula: string | null = null

  private usarApenasApi = false

  constructor()
  constructor(args: ClienteSuapArgs)
  constructor(
    args: ClienteSuapArgs = { credenciais: null, usarApenasApi: false }
  ) {
    this.usarApenasApi = args.usarApenasApi

    if (args.credenciais) {
      this.apiWrapper = new ApiWrapper(args.credenciais.api)
      if (!this.usarApenasApi) {
        this.scrapperWrapper = new ScrapperWrapper(
          args.credenciais.site,
          args.credenciais.matricula
        )
      }
    } else {
      this.apiWrapper = new ApiWrapper()
      if (!this.usarApenasApi) {
        this.scrapperWrapper = new ScrapperWrapper()
      }
    }
  }

  async obterCredenciais(): Promise<Credenciais> {
    const result = {
      matricula: this.matrícula,
      api: this.apiWrapper.token,
      site: null
    }

    if (!this.usarApenasApi) {
      result.site = await this.scrapperWrapper.getCookies()
    }

    return result
  }

  async login(matrícula: string, password: string) {
    this.matrícula = matrícula
    await this.apiWrapper.login(matrícula, password)
    if (!this.usarApenasApi) {
      await this.scrapperWrapper.login(matrícula, password)
    }
  }

  async obterInformaçõesPessoais(): Promise<InformaçõesPessoais> {
    return await this.apiWrapper.obterInformações()
  }

  async obterPeríodosLetivos(): Promise<PeríodoLetivo[]> {
    return await this.apiWrapper.obterPeríodosLetivos()
  }

  async obterNotas(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<Boletim[]> {
    return await this.apiWrapper.obterNotas(anoLetivo, períodoLetivo)
  }

  async detalharNota(códigoDiário: string): Promise<DetalhesNota> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter detalhes de notas apenas da API")
    } else {
      return await this.scrapperWrapper.detalharNota(códigoDiário)
    }
  }

  async obterDocumentos(): Promise<Documento[]> {
    if (this.usarApenasApi) {
      throw new Error("Não é possível obter documentos apenas da API")
    } else {
      return await this.scrapperWrapper.obterDocumentos()
    }
  }

  async obterTurmasVirtuais(
    anoLetivo: number,
    períodoLetivo: number
  ): Promise<TurmaVirtual[]> {
    return await this.apiWrapper.obterTurmasVirtuais(anoLetivo, períodoLetivo)
  }

  async obterDetalhesTurmaVirtual(
    códigoDiário: string
  ): Promise<InformaçõesTurmaVirtual> {
    return await this.apiWrapper.obterInformaçõesTurmaVirtual(códigoDiário)
  }
}
