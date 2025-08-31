

import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
const ProfileSchema = new mongoose.Schema({
  nomeReferencial: {type: String, required: true},
  username: {type: String, required: true},
  emailInstitucional: {type: String, required: true},
  redesSocials: [
    {linkedin: {type: String, default: null}},
    {github: {type: String, default: null}},
    {twitter: {type: String, default: null}},
    {facebook: {type: String, default: null}},
    {instagram: {type: String, default: null}},
    {youtube: {type: String, default: null}}
  ],
  bio: {type: String, default: null},
  email: {type: String, default: null},
  telefone: {type: String, default: null},
  estado: {type: String, default: null},
  pais: {type: String, default: null},
  dataNascimento: {type: Date, default: "BR"},
  nacionalidade: {type: String, default: null},
  educacao:[
    {
      tagEducacao: {type: String, default: null},
      instituicao: {type: String, default: null},
      curso: {type: String, default: null},
      descricao: {type: String, default: null},
      anoInicio: {type: Number, default: null},
      anoFim: {type: Number, default: null},
      logoInstituicao: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
    }
  ],
  projetos:[
    {
      nome: {type: String, default: null},
      descricao: {type: String, default: null},
      ano: {type: Number, default: null},
      repositorio: {type: String, default: null},
      link: {type:String, default:null},
      documentacoes: [{type:String, default:null}],
      cover: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
      icon: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
    }
  ],
  profissionais: [
    {
      nome: {type: String, default: null},
      cargo: {type: String, default: null},
      empresa: {type: String, default: null},
      anoInicio: {type: Number, default: null},
      anoFim: {type: Number, default: null},
      descricao: {type: String, default: null},
      isCurrent: {type: Boolean, default: false},
      logoEmpresa: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
    }
  ]
  ,
  pesquisa:[
    {
      titulo: {type: String, default: null},
      descricao: {type: String, default: null},
      ano: {type: Number, default: null},
      link: {type: String, default: null},
      documento: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
      cover: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
    }
  ],
  habilidades: [{type: String, default: null}],
  certificacoes:[
    {
      nome: {type: String, default: null},
      instituicao: {type: String, default: null},
      ano: {type: Number, default: null},
      descricao: {type: String, default: null},
      certificado: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
    }
  ],
  idiomas:[
    {
      idioma: {type: String, default: null},
      nivel: {type: String, enum:['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'], default: null}
    }
  ],
  interessesProfissionais:[
    {type: String, default: null}
  ],
  fotoPerfil: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
  fotoCapa: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null}
},{
    timestamps: true,
    versionKey: false
});
ProfileSchema.plugin(MongooseDelete, { overrideMethods: 'all',deletedAt: true}); 
export const Profile = mongoose.model('profile', ProfileSchema);