import pool from '../../db'
import { Keyverify } from '../../secretverify';
import dateFormat from 'dateformat'

// params used for this API
// Keyverify,stage,requestId,name,collegeId,role,status,comment
// stage is useful to define which stage of the request is
// Stage1 –– To be Approved
// Stage2 –– To be Issed
// Stage3 –– To be CheckOut
// Stage4 –– To be CheckIn
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    // current date time for updating
    var currentDate =  dateFormat(new Date(Date.now()), 'yyyy-mm-dd HH:MM:ss');
    
    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // verify the role and accordingly update the columns specific to each role
            // if(params.ids[4] == 'Admin' || params.ids[4] == 'SuperAdmin'){
            if(params.ids[1] == 'S1'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE request SET approver ="'+params.ids[4]+'", approverName ="'+params.ids[3]+'", requestStatus ="'+params.ids[6]+'", approvedOn ="'+currentDate+'", comment = CONCAT(comment,"\n'+params.ids[7]+'") where requestId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No request found!'}, {status: 200})
                }
            }
            // else if(params.ids[4] == 'OutingAdmin' || params.ids[4] == 'OutingIssuer'){
            else if(params.ids[1] == 'S2'){
                
                try {
                    const [rows, fields] = await connection.execute('UPDATE request SET issuer ="'+params.ids[4]+'", issuerName ="'+params.ids[3]+'", requestStatus ="'+params.ids[6]+'", issuedOn ="'+currentDate+'", comment = CONCAT(comment,"\n'+params.ids[7]+'") where requestId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No request found!'}, {status: 200})
                }
            }
            // else if(params.ids[4] == 'OutingAssistant'){
            // stage1, requestId, status
            else if(params.ids[1] == 'S3'){ 
                try {
                    const [rows, fields] = await connection.execute('UPDATE request SET isStudentOut = 1, requestStatus ="'+params.ids[3]+'", where requestId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No request found!'}, {status: 200})
                }
                
            }
            // else if(params.ids[4] == 'OutingAssistant'){
            // stage1, requestId, status
            else if(params.ids[1] == 'S4'){ 
                try {
                    const [rows, fields] = await connection.execute('UPDATE request SET isStudentOut = 0, requestStatus ="'+params.ids[3]+'", where requestId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No request found!'}, {status: 200})
                }
                
            }
            else{
                // wrong role
                return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
            }
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (err){
        // some error occured
        return Response.json({status: 500, message:'Facing issues. Please try again!'}, {status: 200})
    }
  }
  